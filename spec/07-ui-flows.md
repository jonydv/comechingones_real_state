# Spec 07 — UI Flows (Flujos de Usuario)

## Principios de diseño

- **Mobile-first**: diseñar para 375px, escalar a desktop
- **Performance**: LCP < 2.5s, imágenes optimizadas con Next.js `<Image>`
- **SEO**: SSR/SSG para todas las páginas públicas, metadata dinámica
- **Accesibilidad**: contraste mínimo WCAG AA, navegación por teclado
- **WhatsApp primero**: el CTA principal en propiedades es siempre el botón de WA

---

## Flujo 1: Visitante en el Marketplace general (marketplace.com)

```
/ (Homepage marketplace)
├── Hero con buscador rápido (zona + operación + tipo)
├── Propiedades destacadas (featured = true, cross-tenant)
├── Sección "Buscar por zona" (grid de zonas con foto)
├── Sección "Agencias del corredor" (logos de tenants activos)
└── Footer

/propiedades (Listado con filtros)
├── Sidebar de filtros (operación, tipo, zona, precio, dormitorios)
├── Barra de búsqueda + ordenamiento + toggle lista/mapa
├── Grid de PropertyCards (12 por defecto)
├── Paginación
└── Tab "Ver mapa" → /propiedades/mapa

/propiedades/mapa (Vista mapa)
├── Mapa fullscreen con pins clusterizados
├── Panel lateral con listado resumido
└── Click en pin → mini-card flotante con link a detalle

/propiedades/[id] (Detalle de propiedad)
├── Galería de fotos (lightbox)
├── Título + precio + badges (tipo, operación, zona)
├── CTA flotante mobile: botón WhatsApp + botón Contactar
├── Descripción
├── Grilla de características (bedrooms, bathrooms, m², etc.)
├── Mapa de ubicación (pin exacto o zona aproximada)
├── Formulario de contacto lateral (desktop) / modal (mobile)
├── Sección "Más propiedades de [Agencia]" (3 cards)
└── Sección "Propiedades similares" (3 cards)
```

### PropertyCard (componente reutilizable)
```
┌─────────────────────────────┐
│  [imagen portada]           │
│  [badge operación] [badge zona]│
├─────────────────────────────┤
│  Título de la propiedad     │
│  💰 USD 85.000              │
│  🛏 3  🚿 2  📐 120m²       │
│  [Logo agencia] Inmob. Sol  │
└─────────────────────────────┘
```

---

## Flujo 2: Visitante en sitio de tenant (agencia.marketplace.com)

```
/ (Homepage del tenant)
├── Header con logo + colores del tenant (branding)
├── Hero personalizado con buscador
├── Propiedades destacadas del tenant
├── Sobre nosotros (description del tenant)
├── Datos de contacto + mapa con ubicación de la agencia
└── Footer con datos del tenant

/propiedades → igual que marketplace pero scope del tenant
/propiedades/[id] → igual pero sin secciones cross-tenant
```

**Diferencias clave vs marketplace**:
- Header con logo y colores del tenant
- Sin secciones que muestren otras agencias
- "Ver más propiedades" navega dentro del tenant
- Datos de contacto del tenant en sidebar/footer

---

## Flujo 3: Agente (panel admin)

### Acceso
```
[subdominio-tenant].marketplace.com/admin
└── Redirect a /admin/login si no autenticado
```

### Navegación admin (AGENT)
```
/admin
├── /admin/dashboard       → resumen: propiedades activas, leads nuevos
├── /admin/propiedades     → listado de SUS propiedades (todas las de su tenant si TENANT_ADMIN)
│   ├── /admin/propiedades/nueva     → formulario crear propiedad
│   └── /admin/propiedades/[id]/editar → formulario editar
└── /admin/leads           → leads de sus propiedades
    └── /admin/leads/[id]  → detalle y gestión de lead
```

### Formulario crear/editar propiedad (wizard en 4 pasos)

**Paso 1 — Información básica**
- Título, descripción (editor markdown básico)
- Tipo de operación, tipo de propiedad
- Precio + moneda

**Paso 2 — Ubicación**
- Zona (select)
- Dirección (texto)
- Mapa interactivo para colocar pin (lat/lng)
- Toggle "mostrar ubicación exacta"

**Paso 3 — Características**
- Dormitorios, baños (steppers)
- Superficies (m²)
- Checkboxes: garage, pileta, amoblado, mascotas, wifi, parrilla

**Paso 4 — Fotos y publicación**
- Upload de fotos (drag & drop, hasta límite del plan)
- Reordenar fotos (drag & drop)
- Marcar portada
- Botón "Guardar borrador" o "Publicar ahora"

---

## Flujo 4: Tenant Admin (panel admin ampliado)

Todo lo del AGENT, más:

```
/admin/agentes             → listado de agentes del tenant
/admin/agentes/nuevo       → crear agente
/admin/branding            → editar logo, colores, datos de contacto
/admin/leads               → TODOS los leads del tenant (no solo propios)
```

### Página de branding
- Upload de logo
- Color picker para primary_color y secondary_color
- Preview en tiempo real del header del sitio
- Datos de contacto: teléfono, WhatsApp, email, redes sociales
- Horarios de atención
- Meta title y description

---

## Flujo 5: Super Admin

```
/super-admin
├── /super-admin/tenants           → listado de todas las agencias
│   ├── /super-admin/tenants/nuevo → crear agencia + admin inicial
│   └── /super-admin/tenants/[id]  → ver, editar, suspender tenant
└── /super-admin/stats             → métricas globales (propiedades, leads, tenants)
```

---

## Componentes de UI clave

| Componente | Descripción |
|---|---|
| `PropertyCard` | Card de listado. Reutilizable en marketplace y tenant. |
| `SearchFilters` | Sidebar de filtros. Colapsable en mobile. |
| `PropertyMap` | Mapa con pins. Usa Mapbox GL JS. |
| `PropertyGallery` | Galería con lightbox. |
| `ContactForm` | Formulario de contacto con reCAPTCHA. |
| `WhatsAppButton` | Botón verde flotante (mobile) o en sidebar (desktop). |
| `TenantHeader` | Header dinámico según branding del tenant. |
| `PriceDisplay` | Muestra precio con moneda y formato local (ARS: punto de miles). |
| `ZoneBadge` | Badge con nombre de zona legible. |

---

## Temas y theming

El sistema de theming aplica las variables CSS del tenant en el `layout.tsx` del grupo de rutas `(tenant)`:

```css
:root {
  --color-primary: [tenant.primary_color];
  --color-secondary: [tenant.secondary_color];
}
```

El marketplace usa colores fijos definidos en `tailwind.config.ts`.

---

## SEO: metadata dinámica

| Página | Title | Description |
|---|---|---|
| Marketplace home | "Propiedades en el Corredor Comechingones" | "Encontrá casas, cabañas y terrenos en el Corredor de los Comechingones, San Luis." |
| Listado marketplace | "Propiedades en [zona] — [operación]" | dinámica según filtros |
| Detalle propiedad | "[Título propiedad] — [Agencia]" | primeros 160 chars de la descripción |
| Homepage tenant | "[Nombre agencia] — Inmobiliaria en [zona]" | descripción del tenant |
| Listado tenant | "Propiedades de [Agencia] en [zona]" | |

Todas las páginas públicas generan `og:image` con la imagen de portada de la propiedad o el logo del tenant.
