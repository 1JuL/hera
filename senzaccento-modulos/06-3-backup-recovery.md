# 06.3 Backup & Recovery

**Tipo:** instructivo + procedimiento de recuperación.
**Entregable del cronograma:** sistema de respaldo de la base de datos funcionando.
**Leer antes:** `00-CONTEXTO.md`, `06-1-despliegue.md`.
**Requisitos cubiertos:** RNF-03, RNF-06.

## Por qué este módulo es necesario

El plan gratuito de Supabase no incluye backups automáticos ni recuperación a un punto en el tiempo (fuentes consultadas el 2 de noviembre de 2026; verificar en la página de precios vigente). Los respaldos diarios son una característica de planes de pago. Además, un proyecto gratuito inactivo se pausa. El respaldo debe construirse por cuenta propia.

## Objetivos de recuperación (propuestos, confirmar con el equipo)

| Indicador | Meta |
|---|---|
| RPO (pérdida máxima de datos) | 24 horas |
| RTO (tiempo máximo para restaurar) | 2 horas |
| Retención | 14 respaldos diarios y 8 semanales |

## Qué se respalda

| Elemento | Fuente de verdad | Respaldo |
|---|---|---|
| Esquema, políticas RLS, funciones, triggers | `supabase/migrations/` en Git | El propio repositorio |
| Catálogo, reglas y formulario | `supabase/seed/` en Git | El propio repositorio |
| Edge Functions | `supabase/functions/` en Git | El propio repositorio |
| Datos de usuarios (negocios, diagnósticos, recomendaciones, conversaciones, feedback, consentimientos) | Base de datos de producción | Volcado programado (este módulo) |
| Cuentas de Auth (`auth.users`) | Base de datos de producción | Volcado de datos del esquema `auth` (ver nota) |
| Archivos | No hay archivos originales (se leen en el navegador) | No aplica |

## Pasos

### 1. Cadena de conexión

1. En el panel de Supabase, *Connect* y copiar la cadena del *pooler* (modo sesión o transacción). Los ejecutores de GitHub Actions normalmente no tienen conectividad IPv6 y la conexión directa de Supabase usa IPv6 en el plan gratuito; usar el pooler. Verificar en la documentación vigente.
2. Guardarla como secreto de GitHub `SUPABASE_DB_URL` (formato `postgresql://postgres.<ref>:<password>@<host>:5432/postgres`).
3. Crear una clave de cifrado con `age` (`age-keygen -o hera-backup.key`). Guardar la clave privada en el gestor de contraseñas del equipo y en una segunda ubicación; la pública en el secreto `BACKUP_AGE_PUBLIC_KEY`. Los respaldos contienen datos personales y deben almacenarse cifrados (RNF-06, Habeas Data).

### 2. Workflow de respaldo

Crear `.github/workflows/backup.yml`:

```yaml
name: Backup DB
on:
  schedule:
    - cron: '0 8 * * *'   # 08:00 UTC = 03:00 hora de Colombia
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      - name: Instalar age
        run: sudo apt-get update && sudo apt-get install -y age
      - name: Volcado
        env:
          DB_URL: ${{ secrets.SUPABASE_DB_URL }}
        run: |
          STAMP=$(date -u +%Y%m%dT%H%M%SZ)
          supabase db dump --db-url "$DB_URL" -f "schema_$STAMP.sql"
          supabase db dump --db-url "$DB_URL" --data-only --use-copy -f "data_$STAMP.sql"
          tar czf "hera_$STAMP.tar.gz" schema_*.sql data_*.sql
          age -r "${{ secrets.BACKUP_AGE_PUBLIC_KEY }}" -o "hera_$STAMP.tar.gz.age" "hera_$STAMP.tar.gz"
          sha256sum "hera_$STAMP.tar.gz.age" > "hera_$STAMP.sha256"
      - uses: actions/upload-artifact@v4
        with:
          name: hera-backup
          path: |
            hera_*.tar.gz.age
            hera_*.sha256
          retention-days: 14
```

Notas:

1. Los artefactos de GitHub Actions tienen retención configurable (hasta 90 días en repositorios privados, según la configuración de la cuenta). Para conservar los 8 respaldos semanales, copiar uno por semana a una ubicación externa de largo plazo (por ejemplo, un almacenamiento en la nube con plan gratuito, cifrado y con acceso restringido) o publicarlo como *Release* privado.
2. `supabase db dump` por defecto vuelca los esquemas de la aplicación y no incluye datos de `auth`. Para conservar cuentas de usuario, añadir un volcado de datos de `auth.users` e `auth.identities` con `pg_dump --data-only --table=auth.users --table=auth.identities`. Verificar el comportamiento del CLI vigente y probar la restauración. Si se decide no respaldar cuentas, los usuarios deberán registrarse de nuevo tras una pérdida total; documentar la decisión.
3. El respaldo incluye el contenido de `messages`. Evaluar si se respalda o se excluye; documentar la decisión según la política de retención de `07-1`.
4. Configurar notificación de fallo: GitHub envía correo por workflows fallidos; añadir además un aviso al canal del equipo.

### 3. Verificación automática del respaldo

Un segundo job semanal descarga el último artefacto, lo descifra con una clave de prueba, restaura en una base de datos Postgres efímera (servicio de contenedor del workflow o `supabase start`) y ejecuta consultas de sanidad: conteo de filas por tabla principal mayor a cero, y `select count(*)` de `diagnostics` igual al conteo registrado por el volcado.

### 4. Procedimiento de recuperación

Escenarios y respuesta:

| Escenario | Respuesta |
|---|---|
| Proyecto pausado | Reactivar desde el panel de Supabase. Los datos se conservan. |
| Datos borrados o corruptos por error | Restaurar el último respaldo en un proyecto nuevo o una base temporal; extraer las filas afectadas y reinsertarlas. |
| Pérdida total del proyecto | Crear un proyecto nuevo y seguir los pasos de abajo. |

Restauración completa:

1. Crear un proyecto nuevo de Supabase y vincularlo (`supabase link --project-ref <nuevo>`).
2. Aplicar el esquema con `supabase db push` (las migraciones son la fuente del esquema) y cargar el seed.
3. Descargar el artefacto más reciente, verificar el hash y descifrar: `age -d -i hera-backup.key hera_<fecha>.tar.gz.age > hera.tar.gz && tar xzf hera.tar.gz`.
4. Cargar solo los datos en tablas de usuario: `psql "$NEW_DB_URL" -v ON_ERROR_STOP=1 -f data_<fecha>.sql`. Desactivar temporalmente triggers si el volcado lo requiere (`SET session_replication_role = replica;`) y reactivarlos al terminar.
5. Restaurar secretos de funciones (`supabase secrets set ...`) y desplegar funciones (`supabase functions deploy`).
6. Actualizar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Vercel, `Site URL` y `Redirect URLs` en Auth, callbacks de OAuth y el monitor de disponibilidad. Redesplegar el frontend.
7. Prueba de humo: login, abrir un diagnóstico existente, enviar un mensaje al asistente.
8. Notificar a los usuarios si hubo pérdida de datos dentro de la ventana de 24 horas.

Documentar el procedimiento en `docs/runbook-recuperacion.md` con los comandos reales del proyecto.

### 5. Ensayo

Antes del lanzamiento y una vez por mes durante la validación: ejecutar una restauración completa en un proyecto de preproducción o en Supabase local, medir el tiempo y anotar los problemas.

## Criterios de aceptación

- [ ] El workflow `backup.yml` se ejecuta cada día y genera un artefacto cifrado con su hash; el historial muestra al menos 7 ejecuciones exitosas consecutivas antes del lanzamiento.
- [ ] Los respaldos están cifrados con `age`; la clave privada no está en el repositorio ni en los secretos de GitHub, y existe en al menos dos ubicaciones controladas por el equipo.
- [ ] Un fallo del respaldo avisa al equipo en menos de 1 hora.
- [ ] El job de verificación restaura el último respaldo en una base efímera y las consultas de sanidad pasan.
- [ ] Se realizó un ensayo de restauración completa siguiendo el runbook, con RTO medido menor o igual a 2 horas.
- [ ] Tras la restauración, el login y la lectura de un diagnóstico previo funcionan.
- [ ] El runbook `docs/runbook-recuperacion.md` existe y fue ejecutado por una persona distinta de la que lo escribió.
- [ ] La decisión sobre respaldar o no `auth` y `messages` está documentada.
- [ ] La retención (14 diarios y 8 semanales) está implementada o documentada con el procedimiento de copia semanal.
