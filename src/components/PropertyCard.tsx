/**
 * PropertyCard — Server Component reutilizable.
 *
 * Estructura según Spec 07 (UI Flows) y shape de datos de Spec 03 (Search):
 * ┌─────────────────────────────┐
 * │  [imagen portada]           │
 * │  [badge operación][badge zona]│
 * ├─────────────────────────────┤
 * │  Título de la propiedad     │
 * │  💰 USD 85.000              │
 * │  🛏 3  🚿 2  📐 120m²       │
 * │  [Logo agencia] Inmob. Sol  │
 * └─────────────────────────────┘
 *
 * Design system (Spec 08):
 * - Cards: rounded-xl, borde 1px, hover:shadow-xl transition-all duration-300
 * - Tipografía: Montserrat para el título, Inter para el resto
 * - Colores: variables CSS (--primary, --secondary, --accent)
 */

import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { zoneLabel, operationStyle, formatPrice } from "@/lib/formatters";

// ─── Tipo: forma del objeto PropertyCard del API (Spec 03) ───────────────────

export type PropertyCardData = {
  id: string;
  title: string;
  coverImageUrl: string | null;
  price: number | null;
  pricePerNight?: number | null;
  currency: "ARS" | "USD";
  operationType: string;
  propertyType: string;
  zone: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaTotalM2?: number | null;
  featured: boolean;
  tenant: {
    name: string;
    slug: string;
    logoUrl: string | null;
  };
};

// ─── Componente ──────────────────────────────────────────────────────────────

type PropertyCardProps = {
  property: PropertyCardData;
  className?: string;
};

export default function PropertyCard({ property, className }: PropertyCardProps) {
  const {
    id,
    title,
    coverImageUrl,
    price,
    pricePerNight,
    currency,
    operationType,
    zone,
    bedrooms,
    bathrooms,
    areaTotalM2,
    featured,
    tenant,
  } = property;

  const opStyle = operationStyle(operationType);
  const priceDisplay = formatPrice(price, currency, pricePerNight);

  return (
    <Link
      href={`/propiedades/${id}`}
      className={cn(
        // Spec 08: Cards con rounded-xl, borde 1px tenue, hover:shadow-xl
        "group relative flex flex-col overflow-hidden rounded-xl border border-border",
        "bg-card text-card-fg",
        "hover:shadow-xl transition-all duration-300",
        className
      )}
      aria-label={`Ver propiedad: ${title}`}
    >
      {/* ── Imagen de portada ─────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={`Portada de ${title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={featured}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Maximize2 className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}

        {/* Badge "Destacada" (Spec 02: featured) */}
        {featured && (
          <span
            className="absolute top-3 left-3 z-10 rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-accent-fg font-body"
            aria-label="Propiedad destacada"
          >
            Destacada
          </span>
        )}

        {/* Badges: operación + zona */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-medium font-body",
              opStyle.className
            )}
          >
            {opStyle.label}
          </span>
          <span className="rounded-md bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary font-body">
            {zoneLabel(zone)}
          </span>
        </div>
      </div>

      {/* ── Cuerpo de la card ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Título — Montserrat Medium */}
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground font-heading">
          {title}
        </h3>

        {/* Precio — Accent color para destacar */}
        <p className="text-lg font-bold text-primary font-heading" aria-label={`Precio: ${priceDisplay}`}>
          {priceDisplay}
        </p>

        {/* Features: dormitorios / baños / superficie */}
        {(bedrooms != null || bathrooms != null || areaTotalM2 != null) && (
          <ul
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-body"
            aria-label="Características de la propiedad"
          >
            {bedrooms != null && (
              <li className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{bedrooms} dorm.</span>
              </li>
            )}
            {bathrooms != null && (
              <li className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{bathrooms} baños</span>
              </li>
            )}
            {areaTotalM2 != null && (
              <li className="flex items-center gap-1">
                <Maximize2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{areaTotalM2} m²</span>
              </li>
            )}
          </ul>
        )}

        {/* Tenant: logo + nombre (siempre al fondo de la card) */}
        <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
          {tenant.logoUrl ? (
            <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-sm">
              <Image
                src={tenant.logoUrl}
                alt={`Logo de ${tenant.name}`}
                fill
                sizes="24px"
                className="object-contain"
              />
            </div>
          ) : (
            // Fallback: inicial del nombre de la agencia
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-xs font-bold text-primary"
              aria-hidden="true"
            >
              {tenant.name.charAt(0)}
            </span>
          )}
          <span className="truncate text-xs text-muted-foreground font-body">
            {tenant.name}
          </span>
        </div>
      </div>
    </Link>
  );
}
