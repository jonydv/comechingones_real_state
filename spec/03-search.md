# Spec 03 — Search (Búsqueda y Filtros)

## Propósito

Definir el contrato de búsqueda de propiedades tanto para el marketplace general (cross-tenant) como para el sitio de un tenant específico.

## Endpoint principal

```
GET /api/properties
```

## Parámetros de búsqueda (query string)

| Parámetro | Tipo | Descripción |
|---|---|---|
| `q` | string | Búsqueda de texto libre (título + descripción + zona) |
| `tenant_slug` | string | Si presente, filtra solo propiedades de ese tenant |
| `operation_type` | enum | `venta` \| `alquiler` \| `alquiler_temporario` |
| `property_type` | string[] | Uno o más de los valores de PropertyType |
| `zone` | string[] | Uno o más de los valores de ComechingoneZone |
| `price_min` | number | Precio mínimo (en la moneda indicada) |
| `price_max` | number | Precio máximo |
| `currency` | enum | `ARS` \| `USD`. Filtra solo propiedades en esa moneda |
| `bedrooms_min` | integer | Mínimo de dormitorios |
| `area_min` | number | Mínimo de m² totales |
| `featured` | boolean | Solo propiedades destacadas |
| `sort` | enum | `reciente` (default) \| `precio_asc` \| `precio_desc` \| `mas_vistas` |
| `page` | integer | Número de página (default: 1) |
| `per_page` | integer | Resultados por página: `12` \| `24` \| `48` (default: 12) |

## Respuesta

```json
{
  "data": [PropertyCard],
  "pagination": {
    "page": 1,
    "per_page": 12,
    "total": 87,
    "total_pages": 8
  },
  "facets": {
    "operation_type": { "venta": 34, "alquiler": 28, "alquiler_temporario": 25 },
    "property_type": { "casa": 20, "cabana": 30, "terreno": 15 },
    "zone": { "merlo": 22, "potrero_de_los_funes": 18 }
  }
}
```

### PropertyCard (objeto en el listado)

```json
{
  "id": "uuid",
  "title": "Cabaña en La Florida con vista al río",
  "cover_image_url": "https://...",
  "price": 85000,
  "currency": "USD",
  "operation_type": "venta",
  "property_type": "cabana",
  "zone": "la_florida",
  "bedrooms": 3,
  "bathrooms": 2,
  "area_total_m2": 120,
  "tenant": {
    "name": "Inmobiliaria Sol",
    "slug": "inmobiliaria-sol",
    "logo_url": "https://..."
  },
  "featured": false,
  "published_at": "2026-03-15T10:00:00Z"
}
```

## Motor de búsqueda

- **Texto libre** (`q`): PostgreSQL `tsvector` con `to_tsquery`. Columnas indexadas: `title`, `description`, `zone`.
- **Geolocalización** (mapa): índice `GIST` sobre columnas `lat`/`lng`.
- **Filtros**: todos los demás parámetros se convierten en cláusulas `WHERE`.
- **Facets**: consulta de conteo agrupado paralela a la consulta principal.
- **Performance**: resultado completo se puede cachear por 5 minutos en edge con `stale-while-revalidate`.

## Vista de mapa

```
GET /api/properties/map
```

Parámetros: igual que `/api/properties` pero sin paginación. Retorna solo coordenadas y datos mínimos para renderizar pins.

```json
{
  "pins": [
    {
      "id": "uuid",
      "lat": -33.123,
      "lng": -66.456,
      "price": 85000,
      "currency": "USD",
      "cover_image_url": "https://...",
      "title": "Cabaña en La Florida"
    }
  ]
}
```

Límite: máximo 500 pins por respuesta. Si hay más propiedades en el viewport, retornar los 500 más recientes.

## Búsqueda por tenant

Cuando el request viene desde un subdominio de tenant (`agencia.marketplace.com`), el middleware inyecta `tenant_id` en el contexto. La capa de búsqueda filtra automáticamente por ese `tenant_id`.

Cuando viene desde el marketplace raíz (`marketplace.com`), no hay filtro por tenant → busca en todos los tenants con `status = active`.

## Comportamiento de paginación

- `page` mínimo: 1
- `per_page` valores aceptados: 12, 24, 48
- Cualquier otro valor de `per_page` → respuesta 400

## Ordenamiento

| sort | Comportamiento |
|---|---|
| `reciente` | `published_at DESC` |
| `precio_asc` | `price ASC`, NULL al final |
| `precio_desc` | `price DESC`, NULL al final |
| `mas_vistas` | `views_count DESC` |

## Reglas

1. Solo se muestran propiedades con `status = disponible` y `deleted_at IS NULL`.
2. Las propiedades de tenants con `status != active` no aparecen en el marketplace general.
3. En el sitio de un tenant, un TENANT_ADMIN autenticado puede ver también las de `status = borrador` y `reservado`.
4. Los facets se calculan sobre el universo filtrado (no sobre todos los registros).
