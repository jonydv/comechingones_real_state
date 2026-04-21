# Spec 04 — Auth (Autenticación y Autorización)

## Propósito

Definir el sistema de autenticación, roles y reglas de autorización de la plataforma.

## Método de autenticación

- **Provider**: NextAuth.js v5 (Auth.js)
- **Método MVP**: Email + contraseña (Credentials provider con bcrypt)
- **Sesión**: JWT almacenado en cookie httpOnly. Expira en 7 días.
- **Futuro (post-MVP)**: Magic link por email, OAuth con Google

## Roles

| Rol | Scope | Descripción |
|---|---|---|
| `SUPER_ADMIN` | Plataforma | Gestiona todos los tenants, ve métricas globales, puede actuar como cualquier tenant |
| `TENANT_ADMIN` | Un tenant | Gestiona su agencia, todos sus agentes y propiedades, ve todos los leads del tenant |
| `AGENT` | Un tenant | Crea y edita sus propias propiedades, ve leads de sus propiedades |
| `PUBLIC` | — | Sin autenticación. Solo acceso de lectura a propiedades disponibles |

## Estructura del JWT

```json
{
  "sub": "user-uuid",
  "email": "agente@sol.com",
  "name": "María González",
  "role": "AGENT",
  "tenant_id": "tenant-uuid",
  "tenant_slug": "inmobiliaria-sol"
}
```

`SUPER_ADMIN` tiene `tenant_id: null`.

## Entidad User

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | UUID | sí | |
| `tenant_id` | UUID FK | condicional | Null solo para SUPER_ADMIN |
| `email` | string | sí | Único en toda la plataforma |
| `password_hash` | string | sí | bcrypt |
| `name` | string | sí | Nombre completo |
| `phone` | string | no | |
| `avatar_url` | string | no | |
| `role` | enum | sí | `SUPER_ADMIN` \| `TENANT_ADMIN` \| `AGENT` |
| `status` | enum | sí | `active` \| `suspended` |
| `created_at` | datetime | sí | Auto |
| `last_login_at` | datetime | no | Actualizado en cada login |
| `deleted_at` | datetime | no | Soft delete |

## Endpoints de autenticación

```
POST /api/auth/signin      → NextAuth callback, retorna JWT
POST /api/auth/signout     → Invalida sesión
POST /api/auth/register    → Solo SUPER_ADMIN puede crear TENANT_ADMIN
                              TENANT_ADMIN puede crear AGENT en su tenant
GET  /api/auth/me          → Retorna perfil del usuario autenticado
PATCH /api/auth/me         → Actualiza nombre, teléfono, avatar
POST /api/auth/me/password → Cambio de contraseña (requiere password actual)
```

## Middleware de autorización

El middleware de Next.js (`middleware.ts`) tiene dos responsabilidades:

1. **Resolución de tenant**: extrae el subdominio del `host` header, busca el tenant en DB (o cache), inyecta `tenant_id` en los headers internos del request.

2. **Protección de rutas**: rutas bajo `/admin/*` requieren rol TENANT_ADMIN+. Rutas bajo `/super-admin/*` requieren SUPER_ADMIN. Redirige a `/login` si no autenticado.

## Matriz de permisos

| Acción | PUBLIC | AGENT | TENANT_ADMIN | SUPER_ADMIN |
|---|---|---|---|---|
| Ver propiedades disponibles | ✓ | ✓ | ✓ | ✓ |
| Ver borradores propios | — | ✓ | ✓ | ✓ |
| Crear propiedad | — | ✓ | ✓ | ✓ |
| Editar propiedad propia | — | ✓ | ✓ | ✓ |
| Editar cualquier propiedad del tenant | — | — | ✓ | ✓ |
| Publicar propiedad | — | ✓ | ✓ | ✓ |
| Ver leads de sus propiedades | — | ✓ | ✓ | ✓ |
| Ver todos los leads del tenant | — | — | ✓ | ✓ |
| Gestionar agentes del tenant | — | — | ✓ | ✓ |
| Editar branding del tenant | — | — | ✓ | ✓ |
| Gestionar todos los tenants | — | — | — | ✓ |
| Cambiar plan de tenant | — | — | — | ✓ |

## Aislamiento de tenant

- Todo endpoint autenticado extrae `tenant_id` del JWT.
- Los handlers de API validan que el recurso solicitado pertenece al `tenant_id` del token.
- Un AGENT no puede acceder a propiedades o leads de otro tenant, aunque tenga el UUID.
- SUPER_ADMIN puede incluir un header `X-Tenant-Override: tenant-uuid` para actuar como ese tenant (útil para soporte).

## Reglas de registro

1. El primer usuario de un tenant es creado por SUPER_ADMIN con rol TENANT_ADMIN.
2. TENANT_ADMIN puede crear AGENTs dentro de su tenant (límite según plan: 1 en free, 5 en pro).
3. No existe registro público (el sitio no tiene "registrate como agencia" autónomo en MVP).
4. Contraseñas: mínimo 8 caracteres, al menos 1 número.

## Manejo de errores de auth

| Caso | Comportamiento |
|---|---|
| No autenticado en ruta protegida | Redirect a `/login?callbackUrl=...` |
| Token expirado | Redirect a `/login` con mensaje "sesión expirada" |
| Rol insuficiente | Retornar 403 con mensaje claro |
| Tenant suspendido | Retornar 403 con mensaje "agencia suspendida" |
| Usuario suspendido | Retornar 403 con mensaje "cuenta suspendida" |
