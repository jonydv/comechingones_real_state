/**
 * HomePage — Marketplace Horizonte Comechingones
 * Spec 07: Hero + buscador · Propiedades destacadas · Zonas · Agencias
 *
 * Server Component: fetchea desde Neon/Prisma en el servidor,
 * pasa datos como props a sub-componentes.
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/formatters";
import type { PropertyCardData } from "@/components/PropertyCard";
import PropertyCard from "@/components/PropertyCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HeroSearch from "@/components/home/HeroSearch";
import ZonesGrid from "@/components/home/ZonesGrid";
import TenantsSection from "@/components/home/TenantsSection";

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Propiedades en el Corredor Comechingones — San Luis",
  description:
    "Encontrá casas, cabañas y terrenos en el Corredor de los Comechingones, San Luis. Compra, alquiler y temporadas en Merlo, El Trapiche, La Florida y más.",
  openGraph: {
    title: "Horizonte Comechingones — Marketplace inmobiliario",
    description:
      "El marketplace inmobiliario de los valles de los Comechingones, San Luis.",
    type: "website",
  },
};

// ─── Data fetching ───────────────────────────────────────────────────────────

async function getFeaturedProperties(): Promise<PropertyCardData[]> {
  const rows = await prisma.property.findMany({
    where: {
      featured: true,
      status: "disponible",
      deletedAt: null,
      tenant: { status: "active" },
    },
    include: {
      location: { select: { zone: true } },
      features: { select: { bedrooms: true, bathrooms: true, areaTotalM2: true } },
      media: { where: { isCover: true }, take: 1, select: { url: true, altText: true } },
      tenant: { select: { name: true, slug: true, logoUrl: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 6,
  });

  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    coverImageUrl: p.media[0]?.url ?? null,
    price: p.price ? Number(p.price) : null,
    pricePerNight: p.pricePerNight ? Number(p.pricePerNight) : null,
    currency: p.currency as "ARS" | "USD",
    operationType: p.operationType,
    propertyType: p.propertyType,
    zone: p.location?.zone ?? "otra",
    bedrooms: p.features?.bedrooms ?? null,
    bathrooms: p.features?.bathrooms ?? null,
    areaTotalM2: p.features?.areaTotalM2 ? Number(p.features.areaTotalM2) : null,
    featured: p.featured,
    tenant: {
      name: p.tenant.name,
      slug: p.tenant.slug,
      logoUrl: p.tenant.logoUrl,
    },
  }));
}

async function getActiveTenantsPreview() {
  return prisma.tenant.findMany({
    where: { status: "active" },
    select: { id: true, name: true, slug: true, logoUrl: true, primaryColor: true },
    orderBy: { createdAt: "asc" },
    take: 12,
  });
}

// ─── Stats estáticas para el hero ────────────────────────────────────────────
// En producción estas vendrían de DB; aquí las mantenemos fijas para evitar
// una query extra en el cold start.
const HERO_STATS = [
  { value: "8+", label: "Zonas del corredor" },
  { value: "100%", label: "Propiedades verificadas" },
  { value: "24 h", label: "Respuesta garantizada" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [featured, tenants] = await Promise.all([
    getFeaturedProperties(),
    getActiveTenantsPreview(),
  ]);

  return (
    <>
      <SiteHeader />

      <main>
        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section
          aria-label="Hero — buscador de propiedades"
          className="relative min-h-[85vh] overflow-hidden bg-primary flex flex-col"
        >
          {/* Imagen de fondo con overlay */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
              alt="Vista panorámica del Corredor Comechingones, San Luis"
              fill
              sizes="100vw"
              className="object-cover opacity-25"
              priority
            />
            {/* Gradient vertical: más oscuro arriba y abajo para el texto */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-primary/60 via-transparent to-primary/80"
              aria-hidden="true"
            />
          </div>

          {/* Contenido del hero */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
            {/* Eyebrow badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/80 font-body backdrop-blur-sm mb-6">
              <Star className="h-3 w-3 text-accent" aria-hidden="true" />
              El corredor serrano de San Luis
            </span>

            {/* Heading principal — Montserrat Bold */}
            <h1 className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl max-w-4xl">
              Encontrá tu lugar en los{" "}
              <span className="text-accent">Comechingones</span>
            </h1>

            <p className="mt-5 max-w-xl font-body text-base text-white/70 sm:text-lg leading-relaxed">
              Cabañas, casas, terrenos y más. En Merlo, El Trapiche, La Florida y
              todo el corredor serrano de San Luis.
            </p>

            {/* Search form — floating card */}
            <div className="mt-10 w-full max-w-3xl">
              <HeroSearch />
            </div>

            {/* Stats */}
            <div className="mt-14 flex flex-wrap justify-center gap-x-10 gap-y-4">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-heading text-2xl font-bold text-accent">
                    {stat.value}
                  </p>
                  <p className="font-body text-xs text-white/60 mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Corte diagonal en la parte inferior */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 bg-background"
            style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}
            aria-hidden="true"
          />
        </section>

        {/* ══ PROPIEDADES DESTACADAS ════════════════════════════════════════ */}
        <section
          aria-labelledby="featured-title"
          className="bg-background py-20 lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="font-body text-sm font-semibold uppercase tracking-widest text-secondary mb-2">
                  Selección premium
                </p>
                <h2
                  id="featured-title"
                  className="font-heading text-3xl font-bold text-foreground lg:text-4xl"
                >
                  Propiedades destacadas
                </h2>
              </div>
              <Link
                href="/propiedades?featured=true"
                className="inline-flex shrink-0 items-center gap-1 font-body text-sm font-medium text-primary underline underline-offset-4 transition-colors hover:text-secondary"
              >
                Ver todas
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Grid */}
            {featured.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <EmptyFeatured />
            )}

            {/* CTA secundario */}
            <div className="mt-12 text-center">
              <Link
                href="/propiedades"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 font-body text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95"
              >
                Explorar todas las propiedades
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══ ZONAS ════════════════════════════════════════════════════════ */}
        <ZonesGrid />

        {/* ══ AGENCIAS ═════════════════════════════════════════════════════ */}
        <TenantsSection tenants={tenants} />

        {/* ══ CTA FINAL ════════════════════════════════════════════════════ */}
        <section
          aria-label="Llamada a la acción para agencias"
          className="bg-secondary/5 py-16 lg:py-20"
        >
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              ¿Tenés una agencia inmobiliaria?
            </h2>
            <p className="mt-4 font-body text-base text-muted-foreground leading-relaxed">
              Publicá tus propiedades en el marketplace del Corredor Comechingones y llegá a
              miles de compradores y turistas de todo el país.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3.5 font-body text-sm font-semibold text-white transition-all hover:bg-primary/90"
              >
                Acceder al panel
              </Link>
              <a
                href="https://wa.me/5492664000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-secondary/40 px-7 py-3.5 font-body text-sm font-semibold text-secondary transition-colors hover:bg-secondary/5"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

// ─── Fallback si no hay propiedades destacadas aún ───────────────────────────

function EmptyFeatured() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
      <p className="font-heading text-lg font-semibold text-foreground">
        Próximamente
      </p>
      <p className="mt-2 font-body text-sm text-muted-foreground max-w-xs">
        Las propiedades destacadas aparecerán aquí cuando estén disponibles.
      </p>
      <Link
        href="/propiedades"
        className="mt-6 inline-flex items-center gap-1.5 font-body text-sm font-medium text-primary underline underline-offset-4"
      >
        Ver todas las propiedades
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
