# Spec 05 — Lead (Consultas y Contacto)

## Propósito

Un Lead es una consulta generada por un visitante interesado en una propiedad o en la agencia en general. Es el principal mecanismo de conversión de la plataforma.

## Entidad Lead

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | UUID | sí | |
| `tenant_id` | UUID FK | sí | Agencia que recibe el lead |
| `property_id` | UUID FK | no | Propiedad consultada (null si es consulta general a la agencia) |
| `agent_id` | UUID FK | no | Agente asignado (tomado de la propiedad si existe) |
| `name` | string | sí | Nombre del interesado |
| `email` | string | condicional | Requerido si no hay `phone` |
| `phone` | string | condicional | Requerido si no hay `email` |
| `message` | text | no | Mensaje libre |
| `source` | enum | sí | `web_form` \| `whatsapp` |
| `status` | enum | sí | `nuevo` \| `contactado` \| `calificado` \| `cerrado` |
| `notes` | text | no | Notas internas del agente (no visibles al visitante) |
| `created_at` | datetime | sí | Auto |
| `updated_at` | datetime | sí | Auto |

## Fuentes de lead

### 1. Formulario web (`source = web_form`)

Formulario embebido en:
- Detalle de propiedad: genera lead con `property_id` asignado
- Homepage del tenant: genera lead sin `property_id`
- Marketplace general: genera lead con `property_id` y `tenant_id` del listado

### 2. WhatsApp (`source = whatsapp`)

El botón de WhatsApp genera un link `wa.me` con mensaje preformateado. El lead se registra **al momento de hacer click** (no al recibir el mensaje en WA, ya que no hay integración API en MVP).

Formato del mensaje preformateado (URL encoded):
```
Hola [Nombre agencia], vi su propiedad "[Título propiedad]" en [URL propiedad] y me gustaría recibir más información. ¡Gracias!
```

Si es consulta general (sin propiedad):
```
Hola [Nombre agencia], los contacto desde [marketplace.com] para consultar sobre sus propiedades disponibles.
```

## Endpoints

```
POST /api/leads                     → Público. Crea un nuevo lead.
GET  /api/admin/leads               → TENANT_ADMIN. Lista leads de su tenant.
GET  /api/admin/leads/[id]          → TENANT_ADMIN. Detalle de un lead.
PATCH /api/admin/leads/[id]         → TENANT_ADMIN o AGENT asignado. Actualiza status y notes.
GET  /api/admin/leads?agent_id=me   → AGENT. Solo ve sus propios leads.
```

## Contrato POST /api/leads

Request body:
```json
{
  "tenant_id": "uuid",
  "property_id": "uuid | null",
  "name": "Juan Pérez",
  "email": "juan@gmail.com",
  "phone": "2664123456",
  "message": "Me interesa saber el precio final",
  "source": "web_form"
}
```

Response 201:
```json
{
  "id": "uuid",
  "message": "Tu consulta fue enviada exitosamente."
}
```

## Listado de leads (admin)

Parámetros de filtro:
- `status`: filtrar por estado
- `property_id`: filtrar por propiedad
- `agent_id`: filtrar por agente
- `source`: filtrar por canal
- `from` / `to`: rango de fechas
- `page` / `per_page`

Respuesta incluye resumen paginado similar a búsqueda de propiedades.

## Reglas de negocio

1. Al crear un lead vía API, se debe proveer al menos `email` o `phone`.
2. El `tenant_id` en el body debe corresponder a un tenant `active`. Si no, retornar 404 (no revelar que existe pero está suspendido).
3. Si `property_id` se provee, debe pertenecer al mismo `tenant_id`. Si no, retornar 400.
4. Rate limiting: máximo 5 leads por IP por hora para prevenir spam.
5. Un AGENT solo puede ver y actualizar leads donde `agent_id = su id`.
6. TENANT_ADMIN puede reasignar un lead a otro agente del mismo tenant.
7. El estado `cerrado` es terminal: no se puede volver a `nuevo`.
8. Al crear el lead, si la propiedad tiene un `agent_id` asignado, el lead hereda ese `agent_id`.

## Notificaciones (MVP simplificado)

- Al crear un lead, enviar email al `TenantSettings.email` si está configurado.
- Librería: Resend o Nodemailer con SMTP propio.
- Template: asunto "Nueva consulta — [título propiedad o 'Consulta general']", body con los datos del lead.
- Si el email falla, el lead igual se crea. No bloquear la operación por falla de email.

## Anti-spam

- reCAPTCHA v3 en el formulario de contacto (score mínimo: 0.5)
- Rate limiting por IP (5 leads / hora)
- Honeypot field oculto en el form: si tiene valor → descartar silenciosamente
