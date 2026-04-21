# Spec 01 — Tenant (Agencia)

## Propósito

Un Tenant representa una agencia inmobiliaria registrada en la plataforma. Es la unidad de aislamiento de datos: todas las propiedades, usuarios y leads pertenecen a un tenant.

## Entidades

### Tenant

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | UUID | sí | Identificador único |
| `name` | string | sí | Nombre de la agencia (ej: "Inmobiliaria Sol del Comechingón") |
| `slug` | string | sí | Subdominio único e inmutable (ej: `sol-comechinon`) |
| `custom_domain` | string | no | Dominio propio opcional (ej: `inmobiliariasol.com.ar`) |
| `logo_url` | string | no | URL del logo subido |
| `primary_color` | string | no | Color primario hex. Default: `#14354D` (Marketplace Navy) |
| `secondary_color` | string | no | Color secundario hex. Default: `#DEAB5E` (Marketplace Gold) |
| `plan` | enum | sí | `free` \| `pro`. Default: `free` |
| `status` | enum | sí | `active` \| `suspended` \| `pending`. Default: `pending` |
| `created_at` | datetime | sí | Auto |
| `updated_at` | datetime | sí | Auto |

### TenantSettings

Relación 1:1 con Tenant. Datos de contacto y configuración operativa.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `tenant_id` | UUID FK | sí | |
| `description` | text | no | Descripción de la agencia (aparece en su homepage) |
| `phone` | string | no | Teléfono de contacto |
| `whatsapp` | string | no | Número de WhatsApp con código de país (ej: `5492664123456`) |
| `email` | string | no | Email de contacto público |
| `address` | string | no | Dirección física de la agencia |
| `instagram_url` | string | no | |
| `facebook_url` | string | no | |
| `website_url` | string | no | Sitio web propio (si tiene aparte del tenant) |
| `business_hours` | jsonb | no | Horarios (ej: `{"lun-vie": "9-18", "sab": "9-13"}`) |
| `meta_title` | string | no | Title SEO para el sitio del tenant |
| `meta_description` | string | no | Description SEO |

## Reglas de negocio

1. El `slug` se genera automáticamente desde `name` al crear el tenant (slugify), pero puede editarse antes de activarse. Una vez `status = active`, el slug es **inmutable**.
2. Slugs reservados que no pueden usarse: `www`, `api`, `admin`, `app`, `mail`, `ftp`, `marketplace`, `static`, `assets`.
3. El `slug` solo puede contener letras minúsculas, números y guiones. Longitud: 3–50 caracteres.
4. `custom_domain` requiere verificación DNS (fuera de scope MVP — placeholder para futuro).
5. Un tenant en `status = suspended` sigue existiendo en DB pero su subdominio retorna 503.
6. Un tenant en `status = pending` solo es visible para Super Admin.
7. Si un tenant es dado de baja o elimina su cuenta, se aplica soft delete y todas sus propiedades, agentes y dominios asociados ("slug" o "custom_domain") resultan inaccesibles inmediatamente en el marketplace para prevenir penalizaciones SEO.
## Plan de suscripción (MVP)

| Feature | Free | Pro |
|---|---|---|
| Propiedades activas | hasta 10 | ilimitadas |
| Agentes | 1 | hasta 5 |
| Fotos por propiedad | hasta 5 | hasta 30 |
| Branding personalizado | logo + colores | sí |
| Dominio personalizado | no | sí |

## Relaciones

- `Tenant` 1 → N `User` (agentes y admins del tenant)
- `Tenant` 1 → N `Property`
- `Tenant` 1 → N `Lead`
- `Tenant` 1 → 1 `TenantSettings`

## Validaciones de API

- `POST /api/admin/tenants`: Solo SUPER_ADMIN. Crea tenant en estado `pending`.
- `PATCH /api/admin/tenants/[id]`: Solo SUPER_ADMIN. Puede cambiar status, plan.
- `GET /api/tenants/[slug]`: Público. Retorna perfil + settings (sin datos sensibles).
- `PATCH /api/tenant/settings`: TENANT_ADMIN autenticado. Actualiza settings de su propio tenant.
