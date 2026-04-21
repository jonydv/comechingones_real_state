# Spec 00 — Visión del Producto

## Problema

Las agencias inmobiliarias del Corredor de los Comechingones (San Luis, Argentina) no tienen presencia digital efectiva. Publicar en portales nacionales (ZonaProp, Argenprop) es costoso y las propiedades se pierden entre cientos de miles de listados sin contexto local. No existe una plataforma regional que entienda el mercado de cabañas, terrenos, y propiedades de montaña de la zona.

## Solución

Una plataforma inmobiliaria regional con dos capas:

1. **Marketplace general** (`marketplace.com`): vitrina pública donde cualquier visitante puede buscar propiedades de todas las agencias del corredor. Punto de entrada para compradores/turistas que buscan "cabaña en Potrero de los Funes" o "terreno en Merlo".

2. **Sitio branded por agencia** (`agencia.marketplace.com`): cada agencia tiene su propio sitio con sus colores, logo, propiedades y datos de contacto. Las agencias pueden compartir este link como su web propia.

## Usuarios objetivo

| Actor                           | Descripción                                       | Motivación principal                                 |
| ------------------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| Visitante / Comprador           | Persona buscando propiedad en la zona             | Encontrar opciones filtradas por zona, tipo y precio |
| Turista                         | Busca alquiler temporario (cabañas, casas)        | Rapidez, fotos, contacto por WhatsApp                |
| Agente inmobiliario             | Gestiona sus propios listados                     | Publicar fácil, gestionar consultas                  |
| Tenant Admin (dueño de agencia) | Gestiona agencia, agentes y todas las propiedades | Control total, ver leads, personalizar branding      |
| Super Admin (plataforma)        | Administra todos los tenants                      | Onboarding de agencias, métricas globales            |

## Zonas geográficas cubiertas

Departamento Pringles y adyacentes, San Luis:

- Merlo
- Los Molles
- Carpintería
- Cortaderas
- Villa Larca
- Papagayos

## Tipos de operación

- **Venta**: precio en ARS o USD
- **Alquiler permanente**: precio mensual en ARS
- **Alquiler temporario**: precio por noche/semana/quincena en ARS (crítico para turismo)

## Tipos de propiedad

- Casa
- Cabaña (tipo relevante localmente)
- Terreno / Lote
- Departamento
- Campo / Propiedad rural
- Local comercial

## KPIs de éxito (MVP)

- Al menos 3 tenants (agencias) activos en los primeros 3 meses
- Al menos 50 propiedades publicadas entre todos los tenants
- Tiempo de carga de listado < 2s (SEO y UX)
- Generación de al menos 1 lead por semana por tenant activo

## Canales de contacto prioritarios

1. **WhatsApp** (primario en Argentina): botón directo en cada propiedad con mensaje preformateado
2. **Formulario de contacto**: nombre, email, teléfono, mensaje
3. **Llamada telefónica**: botón click-to-call en mobile

## Consideraciones locales

- Los precios en USD son comunes para venta de propiedades
- Los alquileres temporarios se expresan en ARS
- El tipo de cambio lo maneja manualmente cada tenant (no depender de APIs externas en MVP)
- Mobile-first: la mayoría de búsquedas son desde celular
- Conectividad variable en zonas de montaña: el sitio debe ser liviano y funcionar bien con señal baja

## Fuera del alcance del MVP

- Pasarela de pagos (reservas online)
- Chat en tiempo real entre usuarios y agencias
- Tasaciones automáticas
- Integración con WhatsApp Business API (solo link directo en MVP)
- App móvil nativa
- Registro y login mediante Api de google como opcional
- Seguridad de los datos rgpd

## Stack Tecnológico Base (Recomendado y Definido)

- **Framework Web**: Next.js 15 (App Router, para SEO y Server Actions).
- **Styling & UI**: Tailwind CSS + shadcn/ui.
- **Base de Datos**: PostgreSQL.
- **ORM**: Prisma (Seguridad de tipado, migraciones robustas y fácil escalabilidad).
- **Almacenamiento de Archivos (Imágenes)**: Amazon S3 (o alternativas compatibles con S3 como Cloudflare R2 / Supabase Storage). Esto permite escalar el almacenamiento de imágenes de forma muy económica y escalable a largo plazo, al contrario que otras soluciones de plataforma más caras.
- **Autenticación**: NextAuth.js v5 (Auth.js).
