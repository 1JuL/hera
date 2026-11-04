# 06.1 Despliegue (Deploy)

**Tipo:** instructivo paso a paso.
**Entregable del cronograma:** dominio, SSL (HTTPS) y CI/CD configurados.
**Leer antes:** `00-CONTEXTO.md`, `04-1-entorno-dev-setup.md`.
**Requisitos cubiertos:** RNF-03, RNF-06.6, RNF-07.

## Resumen del flujo

| Cambio | Disparador | Qué se despliega |
|---|---|---|
| Pull request | Apertura o push a la rama | CI (lint, typecheck, pruebas, build) y *Preview Deployment* de Vercel |
| Merge a `main` | Push a `main` | Vercel despliega el frontend a producción; GitHub Actions aplica migraciones y despliega Edge Functions a Supabase |

## Pasos

### 1. Dominio

1. Opción gratuita: usar el subdominio de Vercel (`hera-senzaccento.vercel.app`). Cumple HTTPS sin costo.
2. Opción con dominio propio: registrar un dominio (un `.com` o `.co` tiene costo anual; verificar precios y si el GitHub Student Developer Pack u otro programa estudiantil ofrece un dominio gratuito). Decisión del equipo.
3. Con dominio propio: en Vercel, *Project > Settings > Domains > Add*. Vercel indica los registros DNS: `A` (o `CNAME` a `cname.vercel-dns.com`) para el subdominio y `A` para el apex. Crearlos en el proveedor de DNS y esperar la propagación (hasta 48 h, normalmente minutos).
4. Redirigir `www` al dominio principal (o viceversa) desde la misma pantalla.

### 2. SSL (HTTPS)

1. Vercel emite y renueva certificados automáticamente al verificar el dominio. No requiere acción manual.
2. Verificar: abrir el sitio con `https://`, comprobar el candado y que `http://` redirige a `https://`.
3. Añadir cabeceras de seguridad en `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "headers": [{
    "source": "/(.*)",
    "headers": [
      { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "Permissions-Policy", "value": "microphone=(self), camera=()" }
    ]
  }]
}
```

El micrófono se permite solo para el propio sitio (voz del asistente). Si se añade una política CSP, incluir los dominios de Supabase, PostHog y Sentry en `connect-src`.

4. En Supabase (*Authentication > URL Configuration*): `Site URL` con el dominio final y `Redirect URLs` con el dominio y los previews necesarios. Actualizar las URIs de callback en Google y Facebook si cambió el dominio.
5. Actualizar CORS de las Edge Functions con el dominio final.

### 3. Variables de entorno en Vercel

*Settings > Environment Variables*, entorno *Production*: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`, `VITE_SENTRY_DSN`, `VITE_WHATSAPP_NUMBER`, `VITE_APP_VERSION`. Para *Preview*, usar los valores de preproducción. Nunca poner `service_role` ni claves de LLM en Vercel.

### 4. CI (GitHub Actions)

Crear `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:coverage
      - run: npm run build
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      - run: supabase start
      - run: supabase test db
      - uses: denoland/setup-deno@v2
      - run: deno test --allow-env --allow-net=127.0.0.1 supabase/functions
```

Marcar el job `test` como check obligatorio en la protección de `main`.

### 5. CD del backend (migraciones y funciones)

Crear `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy backend
on:
  push:
    branches: [main]
    paths: ['supabase/**']

concurrency: deploy-backend

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    env:
      SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
      SUPABASE_PROJECT_REF: ${{ secrets.SUPABASE_PROJECT_REF }}
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      - run: supabase link --project-ref "$SUPABASE_PROJECT_REF"
      - run: supabase db push
      - run: supabase functions deploy
```

1. Crear los secretos en *GitHub > Settings > Secrets and variables > Actions*: `SUPABASE_ACCESS_TOKEN` (token personal de Supabase), `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`.
2. Usar un *Environment* `production` con aprobación manual de un integrante antes de aplicar migraciones.
3. Las migraciones deben ser compatibles hacia atrás con la versión del frontend desplegada (añadir primero, quitar después).
4. Los secretos de funciones (`GEMINI_API_KEY`, `GROQ_API_KEY`, `WEBHOOK_SECRET`) se cargan una vez con `supabase secrets set` y no pasan por el repositorio.

### 6. Preproducción (opcional)

Con el segundo proyecto gratuito de Supabase: variables propias en Vercel *Preview* y un workflow equivalente que despliega la rama `develop` o los PR etiquetados. Sirve para las pruebas de carga y QA.

### 7. Versionado y rollback

1. Etiquetar versiones con `v0.x.y` y poner el valor en `VITE_APP_VERSION`.
2. Rollback del frontend: en Vercel, *Deployments > ... > Promote to Production* sobre un despliegue anterior (instantáneo).
3. Rollback del backend: migración correctiva nueva (no revertir editando migraciones aplicadas) y redeploy de la función anterior desde el commit previo.

### 8. Lista de verificación previa al lanzamiento

- [ ] `Site URL` y `Redirect URLs` finales en Supabase; callbacks de Google y Facebook actualizados.
- [ ] SMTP propio activo; números de prueba de SMS eliminados; CAPTCHA activo.
- [ ] Secretos de funciones cargados; `LLM_PROVIDER` en el valor de producción (no `mock`).
- [ ] Proyecto de Supabase activo (no pausado) y monitor en marcha (ver `06-2`).
- [ ] Respaldo programado funcionando (ver `06-3`).
- [ ] Política de privacidad y términos publicados (ver `07-1`).

## Criterios de aceptación

- [ ] La aplicación responde por HTTPS en el dominio definido; `http://` redirige a `https://`; el certificado es válido.
- [ ] Las cabeceras de seguridad están presentes (verificar con `curl -I`).
- [ ] Cada pull request ejecuta el CI y genera un *Preview Deployment*; el merge se bloquea si el CI falla.
- [ ] Un merge a `main` despliega el frontend a producción sin pasos manuales.
- [ ] Un cambio en `supabase/migrations` o `supabase/functions` se aplica en producción mediante el workflow, con aprobación manual.
- [ ] Ningún secreto está en el repositorio ni en el bundle del cliente (revisión con una búsqueda de patrones y del `dist/`).
- [ ] El rollback del frontend se ensayó una vez y toma menos de 5 minutos.
- [ ] Un despliegue completo desde `main` hasta producción toma menos de 10 minutos.
- [ ] Login, diagnóstico y asistente funcionan en el dominio de producción (prueba de humo manual con la lista de verificación).
