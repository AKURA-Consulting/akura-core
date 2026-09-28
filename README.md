# AKURA CORE

AKURA CORE es el núcleo web interno para gestionar empresas, contactos, leads, oportunidades, tareas, actividades y notas. Esta primera versión usa un Cloudflare Worker para servir la API JSON y Cloudflare D1 para persistir los datos. La interfaz administrativa está escrita en JavaScript y CSS estándar, sin framework de UI.

## Arquitectura

- `src/worker.js`: entrada del Worker y router bajo `/api/*`.
- `src/api/`: contratos por dominio y operaciones CRUD comunes con consultas D1 preparadas.
- `src/index.html`, `src/frontend/`: fuente de la aplicación SPA.
- `scripts/sync-assets.mjs`: sincroniza el frontend a `public/` antes de desarrollo o deploy.
- `public/`: assets estáticos servidos por el binding `ASSETS` de Wrangler.
- `migrations/001_initial.sql`: esquema relacional de D1.
- `migrations/002_relationship_indexes.sql`: índices adicionales para relaciones y listados recientes; no crea tablas.
- `wrangler.toml`: Worker `akura-core`, binding `DB` y assets. El `database_id` configurado se conserva.

El Worker intercepta `/api/*`; Wrangler entrega el frontend estático desde `public/` y configura el fallback SPA. Los IDs se generan con `crypto.randomUUID()` y los timestamps se guardan como ISO 8601 UTC.

## Estructura

```text
src/
  api/                  # Recursos y validación por dominio
  frontend/             # Aplicación SPA y estilos fuente
  index.html
  worker.js
scripts/
  sync-assets.mjs
migrations/
  001_initial.sql
public/                 # Salida estática sincronizada
migrations/             # Esquema e índices de D1
wrangler.toml
package.json
```

Los módulos disponibles son Inicio, Empresas, Contactos, Leads, Oportunidades, Tareas, Actividades y Notas. Notas tiene CRUD completo; Actividades permite listar, crear y ver detalles desde la interfaz. La API ofrece CRUD para los siete recursos.

## Requisitos y configuración

Se usa Node.js, npm y Wrangler (`wrangler` ya está declarado como dependencia de desarrollo). No se requieren paquetes adicionales. La configuración del proyecto es:

- Nombre Wrangler: `akura-core`
- Base D1: `akura-core-db`
- Binding: `DB`
- Variables Worker: `APP_NAME=AKURA CORE`, `ENVIRONMENT=development`

El `database_id` actual está en `wrangler.toml` y se conserva.

## Comandos

```sh
npm run build               # Copia los archivos fuente del frontend a public/
npm run check               # Genera assets y valida el paquete Wrangler sin publicarlo
npm run dev                 # Sincroniza assets y ejecuta Wrangler localmente
npm run db:migrate           # Aplica migraciones solo a la D1 local de Wrangler
npm run db:list              # Lista bases D1 de la cuenta configurada en Wrangler
npm run db:create            # Solicita crear una D1 en Cloudflare; no usar para el entorno local
npm run db:migrate:remote    # Aplica migraciones a D1 remota; requiere decisión explícita
npm run deploy               # Despliega Worker y assets a Cloudflare
```

`db:list`, `db:create`, `db:migrate:remote` y `deploy` interactúan con Cloudflare. No son necesarios para desarrollo local; esta implementación no ejecuta ninguno de ellos.

## Desarrollo local

1. Ejecuta `npm run db:migrate` para crear el esquema en la base local de Wrangler.
2. Ejecuta `npm run dev` y abre la URL local que indique Wrangler.
3. La SPA consume `/api/dashboard` y `/api/companies`, `/api/contacts`, `/api/leads`, `/api/opportunities`, `/api/tasks`, `/api/activities` y `/api/notes`.

No se cargan datos demo automáticamente. Los registros creados desde la aplicación se guardan en D1 local.

## Migraciones y despliegue

Las migraciones viven en `migrations/` y se aplican localmente con `npm run db:migrate`. Antes de un despliegue, ejecuta `npm run check` y revisa el resultado. Aplica las migraciones remotas solo desde una cuenta autorizada y después de confirmar el destino y revisar el SQL; `npm run deploy` no las aplica automáticamente.

**Bloqueo de producción:** esta versión no implementa autenticación ni autorización. La API permite leer, crear, modificar y eliminar datos; no publiques el Worker en una URL accesible hasta proteger la aplicación con Cloudflare Access (incluyendo todas las rutas API) o implementar autenticación en la aplicación. Si habilitas `workers.dev`, comprueba que esa URL también quede protegida o deshabilitada, ya que una protección configurada solo en un dominio personalizado no cubre necesariamente el subdominio `workers.dev`.

## API

Todas las respuestas usan `{ "success": true, "data": ... }` o `{ "success": false, "error": "..." }`. Cada recurso ofrece `GET /api/{recurso}`, `GET /api/{recurso}/:id`, `POST /api/{recurso}`, `PUT /api/{recurso}/:id` y `DELETE /api/{recurso}/:id`. Las colecciones aceptan `?search=texto` y devuelven hasta 200 registros. `/api/dashboard` devuelve métricas agregadas, pipeline por etapa, próximas tareas y actividad reciente. No hay autenticación en esta fase.

## Limitaciones actuales

- El catálogo de relaciones del formulario se limita a los primeros 200 registros que devuelve cada colección.
- Actividades se puede crear, listar y consultar desde la interfaz; edición y eliminación se reservan para una fase posterior. La API sí ofrece esos métodos.
- La aplicación no incluye autenticación, usuarios, roles ni permisos; úsala solo en un entorno de desarrollo controlado hasta que esas funciones estén implementadas.
- En la última verificación local de este workspace, Wrangler 4.142.0 terminó `npm run db:migrate` y `npm run dev` con `write EOF`. El SQL se validó en SQLite local en memoria, pero la ejecución completa con el runtime local de Wrangler debe repetirse cuando ese error esté resuelto.
