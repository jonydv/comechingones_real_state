# Spec 08 — Sistema de Diseño (Design System)

## Principios Centrales

Este sistema de diseño aplica a la plataforma principal (Marketplace). Los sitios de las agencias (Tenants) heredarán estas reglas de tamaño y espaciado, pero inyectarán sus propios colores primarios y secundarios mediante variables CSS. Para el Marketplace base, nos regimos estrictamente por la identidad de marca "Horizonte Comechingones".

## Paleta de Colores (Marketplace Base)

Extraída del imagotipo principal, reflejando el entorno serrano e inmobiliario.

### Colores de Marca
- **Primary (Navy Blue)**: `HEX #14354D`
  - Uso: Header, botones de acción primarios, texto destacado, contornos principales. Proyecta solidez.
- **Secondary (Olive Green)**: `HEX #678D63`
  - Uso: Badges de zonas, acentos en formularios, iconos secundarios. Conecta con el paisaje local.
- **Accent (Sun Gold)**: `HEX #DEAB5E`
  - Uso: Estrellas de favoritos, botones "Destacado", notificaciones o sutiles detalles de hover.

### Colores Neutros & Superficies
- **Background**: `HEX #FAFAFA` (Off-white para contrastar y dar aire a las fotos).
- **Cards**: `HEX #FFFFFF`
- **Text Primary**: `HEX #1F2937` (Gris oscuro, casi negro, para optimizar legibilidad).
- **Text Secondary**: `HEX #8B8B8B` (Gris medio, basado en el logo "Bienes Raíces", para subtítulos).
- **Border**: `HEX #E5E7EB` (Gris muy claro para separadores sutiles).

## Tipografía

Cargadas de manera eficiente (zero CLS) aplicando Next.js (`next/font/google`).

### Headings (Visita y Títulos de Propiedad)
- **Familia**: `Montserrat` (o en su defecto `Outfit`).
- **Pesos**: Medium (500), Semibold (600), Bold (700)
- **Uso**: Títulos principales (h1, h2, h3), títulos de las Propiedades, logotipo general en texto.

### Body (Cuerpo y UI general)
- **Familia**: `Inter` (o `Nunito`).
- **Pesos**: Regular (400), Medium (500)
- **Uso**: Descripciones largas, inputs de formulario, badges de la UI, navegación de menú.

## Reglas de Interfaz (UI Rules)

### Formas (Borders)
- Los bordes deben sentirse orgánicos pero profesionales.
- Componentes interactivos menores (botones, inputs, badges): `rounded-md` o `rounded-lg` (6px - 8px).
- Cards y contenedores grandes (PropertyCard, imágenes modales): `rounded-xl` (12px - 16px).
- **Prohibido**: Bordes filosos (0px radius) y botones "pill" excesivos, salvo para tags.

### Sombras (Elevación)
Sombras suaves y difuminadas para dar tridimensionalidad sin ser artificial.
- Base: Las PropertyCards deben tener un borde tenue de 1px a modo tarjeta física.
- Hover: Aplicar una elevación con sombra difuminada en la Card completa al hacer hover (`hover:shadow-xl transition-all duration-300`).

### Implementación Técnica (Tailwind CSS + shadcn/ui)

La configuración de Tailwind en `tailwind.config.ts` utilizará variables CSS para permitir la sobreescritura de los Tenants dinámicamente:

```css
@layer base {
  :root {
    --primary: 205 58% 19%; /* HSL for #14354D */
    --secondary: 114 17% 47%; /* HSL for #678D63 */
    --accent: 36 67% 62%; /* HSL for #DEAB5E */
  }
}
```

Los componentes de **shadcn/ui** se consumirán e instalarán, pero **tienen que ser estricta y visualmente personalizados** para usar nuestras fuentes y variables en lugar del estilo monocromático/neutral por defecto que traen de fábrica. Esto asegura un aspecto de gama alta ("premium").
