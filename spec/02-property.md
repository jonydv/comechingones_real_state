# Spec 02 — Property (Propiedad)

## Propósito

Una Property es el listado principal de la plataforma. Pertenece siempre a un Tenant y puede estar en distintos estados del ciclo de vida (borrador → disponible → reservado → vendido/alquilado).

## Entidades

### Property

| Campo             | Tipo     | Requerido   | Descripción                                                                 |
| ----------------- | -------- | ----------- | --------------------------------------------------------------------------- |
| `id`              | UUID     | sí          |                                                                             |
| `tenant_id`       | UUID FK  | sí          | Tenant propietario                                                          |
| `agent_id`        | UUID FK  | no          | Agente responsable (opcional)                                               |
| `title`           | string   | sí          | Título del listado (ej: "Cabaña en La Florida con vista al río")            |
| `description`     | text     | no          | Descripción larga (markdown soportado)                                      |
| `price`           | decimal  | condicional | Requerido si `status != borrador` y `operation_type != alquiler_temporario` |
| `price_per_night` | decimal  | condicional | Requerido para `operation_type = alquiler_temporario`                       |
| `currency`        | enum     | sí          | `ARS` \| `USD`. Default: `ARS`                                              |
| `operation_type`  | enum     | sí          | `venta` \| `alquiler` \| `alquiler_temporario`                              |
| `property_type`   | enum     | sí          | Ver enum PropertyType                                                       |
| `status`          | enum     | sí          | `borrador` \| `disponible` \| `reservado` \| `vendido` \| `alquilado`       |
| `featured`        | boolean  | sí          | Si aparece destacada en el marketplace. Default: false                      |
| `views_count`     | integer  | sí          | Contador de vistas. Default: 0                                              |
| `created_at`      | datetime | sí          | Auto                                                                        |
| `updated_at`      | datetime | sí          | Auto                                                                        |
| `published_at`    | datetime | no          | Cuando pasó a `disponible` por primera vez                                  |
| `deleted_at`      | datetime | no          | Soft delete                                                                 |

### PropertyLocation

Relación 1:1 con Property.

| Campo                 | Tipo    | Requerido | Descripción                                                |
| --------------------- | ------- | --------- | ---------------------------------------------------------- |
| `property_id`         | UUID FK | sí        |                                                            |
| `zone`                | enum    | sí        | Ver enum ComechingoneZone                                  |
| `department`          | string  | no        | Departamento de San Luis (default: "Pringles")             |
| `address`             | string  | no        | Dirección visible (puede ser aproximada para privacidad)   |
| `lat`                 | decimal | no        | Latitud (para mapa)                                        |
| `lng`                 | decimal | no        | Longitud (para mapa)                                       |
| `show_exact_location` | boolean | sí        | Si se muestra pin exacto o zona aproximada. Default: false |

### PropertyFeatures

Relación 1:1 con Property.

| Campo                 | Tipo     | Requerido | Descripción                                        |
| --------------------- | -------- | --------- | -------------------------------------------------- |
| `property_id`         | UUID FK  | sí        |                                                    |
| `bedrooms`            | integer  | no        | Cantidad de dormitorios                            |
| `bathrooms`           | integer  | no        | Cantidad de baños                                  |
| `area_total_m2`       | decimal  | no        | Superficie total en m²                             |
| `area_covered_m2`     | decimal  | no        | Superficie cubierta en m²                          |
| `garage`              | boolean  | no        | Tiene garage                                       |
| `pool`                | boolean  | no        | Tiene pileta                                       |
| `furnished`           | boolean  | no        | Amoblado                                           |
| `allows_pets`         | boolean  | no        | Acepta mascotas                                    |
| `has_wifi`            | boolean  | no        | Tiene wifi (relevante para alquileres temporarios) |
| `has_bbq`             | boolean  | no        | Parrilla (muy relevante en cabañas)                |
| `stories`             | integer  | no        | Cantidad de plantas                                |
| `year_built`          | integer  | no        | Año de construcción                                |
| `additional_features` | string[] | no        | Features adicionales en texto libre                |

### PropertyMedia

Relación 1:N con Property.

| Campo         | Tipo    | Requerido | Descripción                                                |
| ------------- | ------- | --------- | ---------------------------------------------------------- |
| `id`          | UUID    | sí        |                                                            |
| `property_id` | UUID FK | sí        |                                                            |
| `url`         | string  | sí        | URL del archivo en Storage (ej: AWS S3 o Supabase Storage) |
| `type`        | enum    | sí        | `image` \| `video`                                         |
| `order`       | integer | sí        | Orden de aparición (0 = portada)                           |
| `is_cover`    | boolean | sí        | Si es la imagen de portada de la card. Default: false      |
| `alt_text`    | string  | no        | Texto alternativo para accesibilidad/SEO                   |

## Enums

### PropertyType

`casa` | `cabana` | `terreno` | `departamento` | `campo` | `local_comercial` | `duplex` | `ph`

### ComechingoneZone

`el_trapiche` | `potrero_de_los_funes` | `la_florida` | `el_volcan` | `merlo` | `los_molles` | `carpinteria` | `villa_de_la_quebrada` | `papagayos` | `quines` | `villa_larca` | `otra`

### OperationType

`venta` | `alquiler` | `alquiler_temporario`

### PropertyStatus

`borrador` | `disponible` | `reservado` | `vendido` | `alquilado`

## Reglas de negocio

1. Para pasar de `borrador` a `disponible`, la propiedad debe tener: `title`, `operation_type`, `property_type`, `zone`, al menos 1 imagen.
2. `price` es requerido para `venta` y `alquiler`. `price_per_night` para `alquiler_temporario`.
3. Solo puede haber 1 `PropertyMedia` con `is_cover = true` por propiedad. Al marcar una nueva como cover, se descarta la anterior.
4. El orden de `PropertyMedia` (campo `order`) debe ser consecutivo desde 0.
5. Límite de imágenes por propiedad: 5 en plan `free`, 30 en plan `pro`.
6. `views_count` se incrementa en cada visita única (por sesión, no por IP en MVP).
7. Soft delete: `deleted_at` se setea; la propiedad no aparece en búsquedas ni en el tenant.
8. `featured` solo puede activarlo TENANT_ADMIN o SUPER_ADMIN.
9. Todas las imágenes subidas deben ser optimizadas a formato WebP (idealmente pre-subida en el cliente o vía función edge/serveless post-subida) limitando su ancho (ej. 1920px máx) para garantizar carga LCP < 2.5s.

## Límites por plan

|                                  | Free | Pro        |
| -------------------------------- | ---- | ---------- |
| Propiedades `disponible` activas | 10   | ilimitadas |
| Imágenes por propiedad           | 5    | 30         |

## Validaciones de API

- `POST /api/properties`: AGENT+. Crea en estado `borrador`. `tenant_id` se toma del JWT.
- `PATCH /api/properties/[id]`: AGENT dueño o TENANT_ADMIN. No puede editar propiedades de otro tenant.
- `DELETE /api/properties/[id]`: Soft delete. AGENT dueño o TENANT_ADMIN.
- `POST /api/properties/[id]/publish`: Transición a `disponible`. Valida reglas de negocio #1 y #2.
- `GET /api/properties/[id]`: Público para propiedades `disponible`; autenticado para `borrador`.
