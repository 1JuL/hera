# 04.1 Entorno de Dev (Setup)

**Tipo:** instructivo paso a paso.
**Entregable del cronograma:** Git configurado y entornos Local y Prod listos.
**Leer antes:** `00-CONTEXTO.md`.

## Prerrequisitos

| Herramienta | Versión | Verificación |
|---|---|---|
| Node.js | 22 LTS o superior | `node -v` |
| npm | 10 o superior | `npm -v` |
| Git | 2.40 o superior | `git --version` |
| Docker Desktop | Reciente (necesario para Supabase local) | `docker info` |
| Cuentas gratuitas | GitHub, Supabase, Vercel | Acceso a cada panel |

## Pasos

### 1. Repositorio y Git

1. Crear en GitHub el repositorio privado `hera` dentro de la cuenta u organización del equipo y añadir a los cuatro integrantes.
2. Clonar y entrar: `git clone git@github.com:<org>/hera.git && cd hera`.
3. Rama principal `main`. Activar en *Settings > Branches* la regla de protección para `main`: pull request obligatorio, 1 aprobación, checks de CI obligatorios, sin push directo.
4. Convención de ramas: `feature/<modulo>-<tarea>`, `fix/<descripcion>`. Commits en formato Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
5. Añadir plantilla de PR en `.github/pull_request_template.md` con: qué cambia, cómo probarlo, criterios de aceptación cubiertos, preguntas abiertas.

### 2. Proyecto base

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install @supabase/supabase-js react-router-dom react-hook-form zod @hookform/resolvers \
  zustand @tanstack/react-query @xyflow/react recharts framer-motion
npm install pdfjs-dist mammoth papaparse
npm install -D tailwindcss @tailwindcss/vite vitest jsdom @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event @playwright/test \
  eslint prettier eslint-config-prettier supabase
```

SheetJS: el paquete `xlsx` de npm está desactualizado. Instalar desde la fuente oficial indicada en la documentación de SheetJS (`https://cdn.sheetjs.com`) y verificar la versión vigente antes de fijarla.

### 3. Tailwind y shadcn/ui

1. En `vite.config.ts` añadir el plugin `@tailwindcss/vite` y el alias `@` -> `./src`.
2. En `src/index.css` poner `@import "tailwindcss";`.
3. Configurar el alias también en `tsconfig.json` y `tsconfig.app.json` (`"paths": { "@/*": ["./src/*"] }`).
4. Ejecutar `npx shadcn@latest init` y elegir el tema base. Los colores de marca (paleta verde de Senzaccento) se definen como variables CSS en `src/index.css` tomando los valores del archivo de Figma.
5. Añadir componentes base: `npx shadcn@latest add button input label card dialog tabs progress toast`.

### 4. Estructura de carpetas

Crear la estructura descrita en `00-CONTEXTO.md` (carpetas vacías con un `.gitkeep`).

### 5. Calidad de código

1. `tsconfig.app.json` con `"strict": true`.
2. Scripts en `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "typecheck": "tsc -b --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:reset": "supabase db reset",
    "db:types": "supabase gen types typescript --local > src/types/database.ts"
  }
}
```

3. Configurar `vitest` en `vite.config.ts` (`test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', globals: true }`).
4. Archivo `.prettierrc` y `.editorconfig`. Opcional: `husky` + `lint-staged` para lint y typecheck antes de cada commit.

### 6. Entorno Local (Supabase en Docker)

1. `npx supabase init` (crea la carpeta `supabase/`).
2. `npx supabase start`. La primera vez descarga imágenes; al terminar imprime la URL de la API (`http://127.0.0.1:54321`), la clave `anon`, la clave `service_role` y la URL de Studio (`http://127.0.0.1:54323`).
3. Crear `.env.local` (no se sube a Git):

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key impresa por supabase start>
```

4. Crear `.env.example` con los mismos nombres y valores vacíos, y commitearlo.
5. En `supabase/config.toml` definir `site_url = "http://localhost:5173"` y `additional_redirect_urls = ["http://localhost:5173/**"]`.
6. Correo local: los correos de Auth llegan a Mailpit (`http://127.0.0.1:54324`). No hay límite de correos en local.
7. SMS local: en `config.toml`, sección `[auth.sms]`, habilitar `enable_signup = true` y usar `[auth.sms.test_otp]` con números de prueba y OTP fijo (por ejemplo `573001234567 = "123456"`). No se envía SMS real.
8. Función de salud: `npx supabase functions new health` y probarla con `npx supabase functions serve`.
9. Cliente Supabase en `src/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

### 7. Entorno Prod (Supabase)

1. En supabase.com crear un proyecto nuevo. Región: la más cercana a Colombia disponible (São Paulo, `sa-east-1`). Guardar la contraseña de la base de datos en el gestor de contraseñas del equipo.
2. Vincular: `npx supabase login` y `npx supabase link --project-ref <ref>`.
3. Aplicar el esquema: `npx supabase db push`.
4. En el panel *Authentication*:
   - *URL Configuration*: `Site URL` con el dominio de Vercel y `Redirect URLs` con el dominio y `http://localhost:5173/**`.
   - *Providers*: habilitar Email, Google y Facebook con las credenciales de cada consola de desarrolladores. Habilitar Phone cuando exista proveedor SMS (ver `04-3`).
   - *SMTP*: configurar SMTP propio (ver `04-3`). El correo integrado solo envía 2 correos por hora.
5. Secretos de funciones: `npx supabase secrets set GEMINI_API_KEY=... GROQ_API_KEY=... WEBHOOK_SECRET=...`.
6. Desplegar funciones: `npx supabase functions deploy`.

### 8. Entorno Prod (Vercel)

1. En vercel.com importar el repositorio de GitHub.
2. Framework: Vite. Build command: `npm run build`. Output: `dist`.
3. Variables de entorno en *Settings > Environment Variables*: las `VITE_*` de producción.
4. Crear `vercel.json` en la raíz para que el enrutado de una SPA funcione:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```

5. Cada pull request genera un *Preview Deployment*. Añadir el patrón de URL de previews a las `Redirect URLs` de Supabase si se probará login en previews.

### 9. Verificación (smoke test)

1. `npm run dev` abre la app en `http://localhost:5173` y carga sin errores en consola.
2. `npm run db:start` levanta Supabase; Studio abre en el puerto 54323.
3. `curl http://127.0.0.1:54321/functions/v1/health` (con `npx supabase functions serve` activo) responde `200`.
4. `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` pasan.
5. Un push a una rama de feature genera un Preview Deployment en Vercel.
6. La app en producción carga por HTTPS y la consola no muestra errores de Supabase.

## Criterios de aceptación

- [ ] Repositorio con `main` protegida, plantilla de PR y convención de commits documentada en `docs/CONTRIBUTING.md`.
- [ ] Un integrante nuevo puede dejar el entorno local funcionando siguiendo solo este archivo en menos de 30 minutos.
- [ ] `npm run dev`, `lint`, `typecheck`, `test` y `build` funcionan desde un clon limpio.
- [ ] Supabase local levanta con `npm run db:start` y las migraciones se aplican con `npm run db:reset`.
- [ ] Proyecto Supabase de producción vinculado, con `Site URL` y `Redirect URLs` configurados.
- [ ] Proyecto Vercel conectado al repositorio con variables de entorno de producción y *Preview Deployments* activos.
- [ ] `.env.local` está en `.gitignore`; `.env.example` existe y no contiene valores reales.
- [ ] Ningún secreto aparece en el historial de Git.

## Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `supabase start` falla | Docker apagado o sin memoria | Iniciar Docker Desktop y asignarle al menos 4 GB |
| Login redirige a `localhost:3000` | `site_url` sin actualizar | Corregir `config.toml` y reiniciar con `supabase stop && supabase start` |
| 404 al recargar una ruta en Vercel | Falta el rewrite de SPA | Añadir `vercel.json` |
| `429 over_email_send_rate_limit` | Correo integrado de Supabase | Configurar SMTP propio |
| La app en producción deja de responder | Proyecto Supabase pausado por inactividad | Reactivarlo desde el panel |
