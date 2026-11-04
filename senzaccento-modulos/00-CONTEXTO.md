# 00 - Contexto global (leer antes de cualquier módulo)

Proyecto: **Hera** (Senzaccento), prototipo funcional de autodiagnóstico, recomendación y mapa de oportunidades TIC para microempresas de Sabana Centro (Colombia). Capstone Design Project, Universidad de La Sabana.

## Arquitectura (decisiones cerradas)

| Capa | Tecnología |
|---|---|
| Interfaz | React + Vite + TypeScript, Tailwind CSS, shadcn/ui, React Router, React Hook Form + Zod, Zustand, TanStack Query, React Flow (`@xyflow/react`), Recharts, Framer Motion |
| Backend | Supabase: Postgres, Auth, Storage, Edge Functions (Deno). No hay servidor propio. |
| Motor de recomendación | Módulo TypeScript puro en el cliente (`src/engine`), reglas con puntuación. El resultado se guarda con la RPC `submit_diagnostic`. |
| Lectura de archivos | En el navegador: PDF.js, SheetJS, mammoth.js. El archivo no se sube; solo se guarda el resumen que el usuario aprueba. |
| Asistente | Edge Function `assistant-chat` -> Gemini, con Groq de respaldo. Voz con Web Speech API en el cliente. |
| Autenticación | Supabase Auth: correo + contraseña, Google/Facebook, verificación por SMS (OTP). Login obligatorio. |
| Despliegue | Vercel (frontend), Supabase (backend), GitHub Actions (CI/CD) |
| Medición | PostHog, Sentry, UptimeRobot |

Contrato de API: documento "Hera - Diseño de APIs y Webhooks" (v2). Si este archivo y el documento difieren, gana el documento y se avisa al equipo.

## Alcance funcional (resumen)

Requisitos RF-01 a RF-10 y RNF-01 a RNF-09 de la Fase 2. Historias en alcance: HU1 a HU4, HU8, HU9, HU11 y HU5 de forma parcial. Fuera de alcance: HU6, HU7 y HU10.

## Estructura del repositorio

```
hera/
  src/
    app/                 rutas, layout, providers
    features/{auth,business,diagnostic,recommendations,map,assistant,stats,guide,feedback,legal}/
    engine/              motor de reglas, tipos, generación del mapa, parsers de archivos
    components/          UI compartida (shadcn/ui)
    lib/                 cliente Supabase, utilidades, analytics
    types/               tipos generados de la base de datos
  supabase/
    migrations/          SQL versionado
    functions/{assistant-chat,export-my-data,delete-account,notify-feedback,health,_shared}/
    seed/                catálogo, reglas, formulario
    tests/               pruebas pgTAP
  tests/e2e/             Playwright
  tests/load/            k6
  .github/workflows/
  docs/
```

## Reglas para el agente

1. Trabaja un módulo a la vez, en una rama `feature/<modulo>-<tarea>`, con commits en formato Conventional Commits.
2. No inventes datos del catálogo, cifras ni fuentes. Si falta información, deja un `TODO(equipo):` y lista la pregunta en la descripción del PR.
3. Nunca escribas claves, tokens ni contraseñas en el repositorio. Solo `.env.example` con nombres de variables.
4. La clave `service_role` no llega nunca al cliente.
5. Todo cambio de esquema es una migración nueva en `supabase/migrations`. No se edita una migración ya aplicada.
6. Toda tabla nueva lleva RLS y al menos una prueba que intenta leer datos de otro usuario.
7. El texto visible para el usuario va en español de Colombia, en lenguaje sencillo y sin tecnicismos.
8. No envíes datos personales (correo, nombre, teléfono) a ningún LLM ni a PostHog.
9. Antes de dar una tarea por terminada: `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` pasan sin errores.
10. Los límites de los planes gratuitos cambian. Verifica la documentación oficial antes de depender de una cifra.

## Variables de entorno

| Variable | Dónde | Uso |
|---|---|---|
| `VITE_SUPABASE_URL` | Cliente | URL del proyecto |
| `VITE_SUPABASE_ANON_KEY` | Cliente | Clave pública (anon / publishable) |
| `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` | Cliente | Analítica |
| `VITE_SENTRY_DSN` | Cliente | Errores |
| `VITE_WHATSAPP_NUMBER` | Cliente | Número para `wa.me` |
| `VITE_APP_VERSION` | Cliente | Versión para reportes de feedback |
| `GEMINI_API_KEY`, `GROQ_API_KEY` | Secreto de Edge Functions | LLM |
| `SENTRY_DSN_FUNCTIONS` | Secreto de Edge Functions | Errores en funciones |
| `WEBHOOK_SECRET` | Secreto de Edge Functions | Valida el Database Webhook |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo Edge Functions (la inyecta Supabase) | Operaciones administrativas |
| `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF` | Secretos de GitHub Actions | Despliegue y respaldos |

## Orden sugerido de los módulos

| Orden | Archivo | Tipo |
|---|---|---|
| 1 | `04-1-entorno-dev-setup.md` | Instructivo |
| 2 | `04-2-implementacion-core.md` | Plan de desarrollo |
| 3 | `04-3-integracion-terceros.md` | Plan de desarrollo |
| 4 | `05-1-pruebas-unitarias.md` | Plan de desarrollo |
| 5 | `05-2-qa-interfaz.md` | Plan de pruebas |
| 6 | `05-3-pruebas-carga.md` | Plan de pruebas |
| 7 | `06-1-despliegue.md` | Instructivo |
| 8 | `06-2-analytics-monitoreo.md` | Instructivo |
| 9 | `06-3-backup-recovery.md` | Instructivo |
| 10 | `07-1-proteccion-datos.md` | Plan con insumo legal |
| 11 | `07-2-feedback-loop.md` | Plan de desarrollo |

Los módulos 04-2 y 04-3 se solapan por sprint (login y asistente). Las pruebas (05-x) se escriben junto al código, no al final.
