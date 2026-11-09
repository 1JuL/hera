-- =============================================================================
-- Migración 0001: Esquema de Autenticación, Negocios, Cuestionario y Diagnósticos
-- Plataforma Hera (Grupo Senzaccento - Universidad de La Sabana)
-- =============================================================================

-- 1. Extensión para UUIDs (activa por defecto en Supabase)
create extension if not exists "uuid-ossp";

-- 2. Tabla: Perfil del Negocio (businesses)
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Mi Negocio',
  sector text,
  municipio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Tabla: Versiones del Cuestionario (questionnaire_versions)
create table if not exists public.questionnaire_versions (
  id text primary key,                     -- e.g. '1.0.0'
  title text not null,
  schema jsonb not null,
  published_at timestamptz default now()
);

-- Semilla inicial de la versión 1.0.0
insert into public.questionnaire_versions (id, title, schema)
values (
  '1.0.0',
  'Cuestionario de Diagnóstico y Oportunidades TIC Senzaccento',
  '{"version": "1.0.0", "target": "microempresas_sabana_centro"}'::jsonb
)
on conflict (id) do nothing;

-- 4. Tabla: Respuestas del Cuestionario (questionnaire_responses)
create table if not exists public.questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  version_id text not null references public.questionnaire_versions(id),
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'completed')),
  source text not null default 'form' check (source in ('form', 'import')),
  completed_at timestamptz,
  updated_at timestamptz default now(),
  constraint unique_owner_questionnaire_version unique (owner_id, version_id)
);

-- 5. Tabla: Diagnósticos y Puntajes (diagnostics)
create table if not exists public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  response_id uuid references public.questionnaire_responses(id) on delete cascade,
  scores jsonb not null,                   -- overallIndex, areaScores, brechas, canales, pagos
  engine_version text not null default '1.0.0',
  created_at timestamptz default now()
);

-- 6. Trigger automático: Crear negocio al registrarse un nuevo usuario en auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  b_name text;
begin
  b_name := coalesce(new.raw_user_meta_data->>'business_name', 'Mi Negocio');
  if b_name = '' then
    b_name := 'Mi Negocio';
  end if;

  insert into public.businesses (owner_id, name)
  values (new.id, b_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- 7. SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- Asegura que ningún usuario acceda a datos de otras empresas
-- =============================================================================

alter table public.businesses enable row level security;
alter table public.questionnaire_versions enable row level security;
alter table public.questionnaire_responses enable row level security;
alter table public.diagnostics enable row level security;

-- Políticas para businesses
drop policy if exists "own_business_select" on public.businesses;
create policy "own_business_select" on public.businesses
  for select using (auth.uid() = owner_id);

drop policy if exists "own_business_insert" on public.businesses;
create policy "own_business_insert" on public.businesses
  for insert with check (auth.uid() = owner_id);

drop policy if exists "own_business_update" on public.businesses;
create policy "own_business_update" on public.businesses
  for update using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "own_business_delete" on public.businesses;
create policy "own_business_delete" on public.businesses
  for delete using (auth.uid() = owner_id);

-- Políticas para questionnaire_versions (lectura pública de esquemas)
drop policy if exists "questionnaire_versions_read" on public.questionnaire_versions;
create policy "questionnaire_versions_read" on public.questionnaire_versions
  for select using (true);

-- Políticas para questionnaire_responses
drop policy if exists "own_responses_select" on public.questionnaire_responses;
create policy "own_responses_select" on public.questionnaire_responses
  for select using (auth.uid() = owner_id);

drop policy if exists "own_responses_insert" on public.questionnaire_responses;
create policy "own_responses_insert" on public.questionnaire_responses
  for insert with check (auth.uid() = owner_id);

drop policy if exists "own_responses_update" on public.questionnaire_responses;
create policy "own_responses_update" on public.questionnaire_responses
  for update using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "own_responses_delete" on public.questionnaire_responses;
create policy "own_responses_delete" on public.questionnaire_responses
  for delete using (auth.uid() = owner_id);

-- Políticas para diagnostics
drop policy if exists "own_diagnostics_select" on public.diagnostics;
create policy "own_diagnostics_select" on public.diagnostics
  for select using (auth.uid() = owner_id);

drop policy if exists "own_diagnostics_insert" on public.diagnostics;
create policy "own_diagnostics_insert" on public.diagnostics
  for insert with check (auth.uid() = owner_id);

drop policy if exists "own_diagnostics_delete" on public.diagnostics;
create policy "own_diagnostics_delete" on public.diagnostics
  for delete using (auth.uid() = owner_id);

-- =============================================================================
-- 8. FUNCIÓN RPC: Benchmark Agregado Anónimo (Privacidad n >= 10)
-- =============================================================================
create or replace function public.sector_benchmark(p_sector text default null, p_municipio text default null)
returns table (
  sample_size bigint,
  avg_overall_index numeric,
  sector text,
  municipio text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  total_count bigint;
begin
  select count(*) into total_count
  from public.questionnaire_responses r
  left join public.businesses b on b.id = r.business_id
  where r.status = 'completed'
    and (p_sector is null or b.sector = p_sector)
    and (p_municipio is null or b.municipio = p_municipio);

  -- Regla de privacidad estadística: solo si hay al menos 10 negocios
  if total_count >= 10 then
    return query
    select
      total_count as sample_size,
      round(avg((d.scores->>'overallIndex')::numeric), 1) as avg_overall_index,
      p_sector as sector,
      p_municipio as municipio
    from public.questionnaire_responses r
    left join public.businesses b on b.id = r.business_id
    join public.diagnostics d on d.response_id = r.id
    where r.status = 'completed'
      and (p_sector is null or b.sector = p_sector)
      and (p_municipio is null or b.municipio = p_municipio);
  else
    return;
  end if;
end;
$$;
