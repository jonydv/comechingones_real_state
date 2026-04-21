# Spec 06 — API Contracts (OpenAPI 3.1)

## Base URL

- Producción: `https://marketplace.com/api`
- Desarrollo: `http://localhost:3000/api`

## Autenticación

Endpoints protegidos requieren header:
```
Authorization: Bearer <jwt>
```
O cookie `next-auth.session-token` (gestionado automáticamente por NextAuth).

## Convenciones

- Todas las respuestas son `application/json`
- Fechas en ISO 8601 UTC
- UUIDs en formato estándar
- Errores siguen el formato:
```json
{
  "error": "mensaje legible",
  "code": "ERROR_CODE",
  "details": {}
}
```
- Paginación siempre incluye el objeto `pagination`

---

## Propiedades

### GET /api/properties
Búsqueda pública de propiedades. Ver spec 03 para parámetros completos.

**Auth**: público  
**Query params**: ver `spec/03-search.md`  
**Response 200**: `{ data: PropertyCard[], pagination, facets }`

---

### GET /api/properties/map
Pins para vista de mapa.

**Auth**: público  
**Query params**: mismos filtros que `/api/properties` (sin paginación)  
**Response 200**: `{ pins: MapPin[] }` — máximo 500 elementos

---

### GET /api/properties/[id]
Detalle completo de una propiedad.

**Auth**: público para `disponible`; AGENT+ para `borrador`  
**Response 200**:
```json
{
  "id": "uuid",
  "title": "...",
  "description": "...",
  "price": 85000,
  "currency": "USD",
  "operation_type": "venta",
  "property_type": "cabana",
  "status": "disponible",
  "featured": false,
  "views_count": 142,
  "published_at": "2026-03-15T10:00:00Z",
  "location": {
    "zone": "la_florida",
    "address": "Calle Los Álamos s/n",
    "lat": -33.123,
    "lng": -66.456,
    "show_exact_location": true
  },
  "features": {
    "bedrooms": 3,
    "bathrooms": 2,
    "area_total_m2": 120,
    "area_covered_m2": 85,
    "garage": true,
    "pool": false,
    "furnished": true,
    "allows_pets": false,
    "has_wifi": true,
    "has_bbq": true
  },
  "media": [
    { "url": "https://...", "type": "image", "order": 0, "is_cover": true, "alt_text": "Vista frontal" }
  ],
  "tenant": {
    "name": "Inmobiliaria Sol",
    "slug": "inmobiliaria-sol",
    "logo_url": "https://...",
    "whatsapp": "5492664123456"
  }
}
```
**Response 404**: propiedad no encontrada o pertenece a tenant inactivo

---

### POST /api/properties
Crear propiedad nueva (en estado `borrador`).

**Auth**: AGENT+  
**Body**:
```json
{
  "title": "...",
  "description": "...",
  "operation_type": "venta",
  "property_type": "cabana",
  "currency": "USD",
  "price": 85000,
  "location": { "zone": "la_florida", "address": "...", "lat": null, "lng": null },
  "features": { "bedrooms": 3, "bathrooms": 2 }
}
```
**Response 201**: objeto Property completo  
**Response 400**: validación fallida (detalla campos inválidos)  
**Response 403**: límite de plan alcanzado

---

### PATCH /api/properties/[id]
Actualizar propiedad. Acepta body parcial (solo los campos a modificar).

**Auth**: AGENT dueño o TENANT_ADMIN  
**Response 200**: objeto Property actualizado  
**Response 403**: no es dueño ni TENANT_ADMIN  
**Response 404**: no existe o es de otro tenant

---

### POST /api/properties/[id]/publish
Transicionar propiedad a `disponible`.

**Auth**: AGENT dueño o TENANT_ADMIN  
**Response 200**: `{ status: "disponible", published_at: "..." }`  
**Response 422**: faltan campos requeridos para publicar (lista de campos faltantes)

---

### DELETE /api/properties/[id]
Soft delete de propiedad.

**Auth**: AGENT dueño o TENANT_ADMIN  
**Response 204**: sin body

---

### POST /api/properties/[id]/media
Subir imagen/video a una propiedad.

**Auth**: AGENT dueño o TENANT_ADMIN  
**Body**: `multipart/form-data` con campo `file` (image/jpeg, image/png, image/webp — máx 10MB)  
**Response 201**: objeto PropertyMedia  
**Response 413**: archivo demasiado grande  
**Response 403**: límite de imágenes según plan alcanzado

---

### DELETE /api/properties/[id]/media/[mediaId]
Eliminar un archivo de media.

**Auth**: AGENT dueño o TENANT_ADMIN  
**Response 204**: sin body

---

## Tenants

### GET /api/tenants/[slug]
Perfil público de una agencia.

**Auth**: público  
**Response 200**:
```json
{
  "name": "Inmobiliaria Sol",
  "slug": "inmobiliaria-sol",
  "logo_url": "https://...",
  "primary_color": "#2563EB",
  "description": "...",
  "settings": {
    "phone": "...",
    "whatsapp": "5492664123456",
    "email": "contacto@sol.com",
    "instagram_url": "...",
    "business_hours": { "lun-vie": "9-18" }
  }
}
```
**Response 404**: tenant no existe o no está activo

---

### PATCH /api/tenant/settings
Actualizar settings del propio tenant.

**Auth**: TENANT_ADMIN  
**Body**: campos parciales de `TenantSettings` + branding (logo, colores)  
**Response 200**: settings actualizados

---

## Leads

### POST /api/leads
Crear consulta (público).

**Auth**: público (con reCAPTCHA)  
**Body**: ver spec 05  
**Response 201**: `{ id, message }`  
**Response 400**: validación fallida  
**Response 429**: rate limit excedido

---

### GET /api/admin/leads
Listar leads del tenant autenticado.

**Auth**: TENANT_ADMIN (todos los leads) o AGENT (solo sus leads)  
**Query params**: `status`, `property_id`, `agent_id`, `source`, `from`, `to`, `page`, `per_page`  
**Response 200**: `{ data: Lead[], pagination }`

---

### PATCH /api/admin/leads/[id]
Actualizar estado y notas de un lead.

**Auth**: TENANT_ADMIN o AGENT asignado  
**Body**: `{ status?, notes?, agent_id? }`  
**Response 200**: Lead actualizado

---

## Admin (Super Admin)

### GET /api/super-admin/tenants
**Auth**: SUPER_ADMIN  
**Response 200**: lista paginada de todos los tenants

### POST /api/super-admin/tenants
**Auth**: SUPER_ADMIN  
Crear nuevo tenant + TENANT_ADMIN inicial.

### PATCH /api/super-admin/tenants/[id]
**Auth**: SUPER_ADMIN  
Actualizar plan, status de cualquier tenant.

### POST /api/super-admin/tenants/[id]/users
**Auth**: SUPER_ADMIN  
Crear TENANT_ADMIN para un tenant.

---

## Códigos de error estándar

| Code | HTTP | Descripción |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Body inválido, falló validación de Zod (devuelve array con errores precisos) |
| `UNAUTHORIZED` | 401 | No autenticado |
| `FORBIDDEN` | 403 | Sin permisos para esta acción |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `PLAN_LIMIT_REACHED` | 403 | Límite del plan alcanzado |
| `RATE_LIMIT_EXCEEDED` | 429 | Demasiadas requests |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |
