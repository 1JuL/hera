-- Migración 0001: Esquema de Cuestionario, Negocios, Respuestas y Diagnósticos
-- Cumple con la Sección 5 de la Guía de Implementación Senzaccento

-- 1. Versiones del Cuestionario
create table if not exists questionnaire_versions (
  id text primary key,                     -- e.g. '1.0.0'
  schema jsonb not null,
  published_at timestamptz default now()
);

-- 2. Perfil del Negocio
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade,
  name text,
  sector text,
  municipio text,
  created_at timestamptz default now()
);

-- 3. Respuestas del Cuestionario (Borrador o Completado, origen Form o Import)
create table if not exists questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses on delete cascade,
  version_id text not null references questionnaire_versions(id),
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','completed')),
  source text not null default 'form' check (source in ('form','import')),
  completed_at timestamptz,
  updated_at timestamptz default now()
);

-- 4. Diagnósticos y Puntajes
create table if not exists diagnostics (
  id uuid primary key default gen_random_uuid(),
  response_id uuid unique references questionnaire_responses(id) on delete cascade,
  scores jsonb not null,                   -- índice por área, brechas, canales, disciplina
  engine_version text not null,
  created_at timestamptz default now()
);

-- Habilitar Row Level Security (RLS)
alter table businesses enable row level security;
alter table questionnaire_responses enable row level security;
alter table diagnostics enable row level security;
alter table questionnaire_versions enable row level security;

-- Políticas de RLS
create policy "questionnaire_versions_public_read" on questionnaire_versions
  for select using (true);

create policy "own_business" on businesses
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "own_responses" on questionnaire_responses
  for all using (
    business_id is null or business_id in (select id from businesses where owner_id = auth.uid())
  )
  with check (
    business_id is null or business_id in (select id from businesses where owner_id = auth.uid())
  );

create policy "own_diagnostics" on diagnostics
  for all using (
    response_id in (
      select r.id from questionnaire_responses r
      left join businesses b on b.id = r.business_id
      where b.owner_id = auth.uid() or b.id is null
    )
  );

-- Función de Benchmark Anónimo Sectorial (≥ 10 negocios requeridos)
create or replace function sector_benchmark(p_sector text, p_municipio text)
returns table (
  sample_size bigint,
  avg_overall_index numeric,
  sector text,
  municipio text
)
language plpgsql
security definer
as $$
declare
  total_count bigint;
begin
  select count(*) into total_count
  from questionnaire_responses r
  join businesses b on b.id = r.business_id
  where r.status = 'completed'
    and (p_sector is null or b.sector = p_sector)
    and (p_municipio is null or b.municipio = p_municipio);

  -- Regla de privacidad: solo si hay al menos 10 negocios
  if total_count >= 10 then
    return query
    select
      total_count as sample_size,
      round(avg((d.scores->>'overallIndex')::numeric), 1) as avg_overall_index,
      p_sector as sector,
      p_municipio as municipio
    from questionnaire_responses r
    join businesses b on b.id = r.business_id
    join diagnostics d on d.response_id = r.id
    where r.status = 'completed'
      and (p_sector is null or b.sector = p_sector)
      and (p_municipio is null or b.municipio = p_municipio);
  else
    return;
  end if;
end;
$$;
