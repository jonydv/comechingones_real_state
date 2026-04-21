/**
 * /propiedades/[id] — Detalle de propiedad
 * Server Component. params es una Promise en Next.js 16 → await requerido.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Maximize2, MapPin, ArrowLeft, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import PropertyCard, { type PropertyCardData } from "@/components/PropertyCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PropertyGallery from "./PropertyGallery";
import ContactForm from "./ContactForm";
import WhatsAppButton from "./WhatsAppButton";
import {
  zoneLabel,
  operationStyle,
  formatPrice,
  propertyTypeLabel,
} from "@/lib/formatters";

// ─── Metadata dinámica ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      tenant: { select: { name: true } },
      media: { where: { isCover: true }, select: { url: true }, take: 1 },
    },
  });

  if (!property) return { title: "Propiedad no encontrada" };

  return {
    title: `${property.title} — ${property.tenant.name} | Horizonte Comechingones`,
    description: property.description?.slice(0, 160) ?? undefined,
    openGraph: {
      images: property.media[0]?.url ? [property.media[0].url] : [],
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function featureItem(label: string, value: string | number | boolean | null | undefined) {
  if (value == null || value === false) return null;
  return { label, value: value === true ? "Sí" : String(value) };
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function PropiedadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id, deletedAt: null },
    include: {
      tenant: {
        include: {
          settings: true,
        },
      },
      location: true,
      features: true,
      media: { orderBy: { order: "asc" } },
    },
  });

  if (!property || property.status === "borrador") {
    notFound();
  }

  // Increment views count (fire and forget)
  prisma.property
    .update({ where: { id }, data: { viewsCount: { increment: 1 } } })
    .catch(() => {});

  const opStyle = operationStyle(property.operationType);
  const priceDisplay = formatPrice(
    property.price ? Number(property.price) : null,
    property.currency,
    property.pricePerNight ? Number(property.pricePerNight) : null
  );
  const zone = property.location?.zone ?? "otra";
  const whatsappNumber = property.tenant.settings?.whatsapp ?? "";
  const propertyUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/propiedades/${id}`;
  const waMessage = `Hola ${property.tenant.name}, vi su propiedad "${property.title}" en ${propertyUrl} y me gustaría recibir más información. ¡Gracias!`;

  // Features grid items
  const featureItems = [
    featureItem("Dormitorios", property.features?.bedrooms),
    featureItem("Baños", property.features?.bathrooms),
    featureItem(
      "Sup. total",
      property.features?.areaTotalM2
        ? `${Number(property.features.areaTotalM2)} m²`
        : null
    ),
    featureItem(
      "Sup. cubierta",
      property.features?.areaCoveredM2
        ? `${Number(property.features.areaCoveredM2)} m²`
        : null
    ),
    featureItem("Cochera", property.features?.garage),
    featureItem("Pileta", property.features?.pool),
    featureItem("Amoblado", property.features?.furnished),
    featureItem("Acepta mascotas", property.features?.allowsPets),
    featureItem("WiFi", property.features?.hasWifi),
    featureItem("Parrilla", property.features?.hasBbq),
    featureItem("Pisos", property.features?.stories),
    featureItem("Año construcción", property.features?.yearBuilt),
  ].filter(Boolean) as { label: string; value: string }[];

  // More properties from same tenant
  const moreProperties = await prisma.property.findMany({
    where: {
      tenantId: property.tenantId,
      status: "disponible",
      deletedAt: null,
      NOT: { id },
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
    include: {
      tenant: { select: { name: true, slug: true, logoUrl: true } },
      location: { select: { zone: true } },
      features: { select: { bedrooms: true, bathrooms: true, areaTotalM2: true } },
      media: { where: { isCover: true }, select: { url: true }, take: 1 },
    },
  });

  const moreCards: PropertyCardData[] = moreProperties.map((p) => ({
    id: p.id,
    title: p.title,
    coverImageUrl: p.media[0]?.url ?? null,
    price: p.price ? Number(p.price) : null,
    pricePerNight: p.pricePerNight ? Number(p.pricePerNight) : null,
    currency: p.currency,
    operationType: p.operationType,
    propertyType: p.propertyType,
    zone: p.location?.zone ?? "otra",
    bedrooms: p.features?.bedrooms ?? null,
    bathrooms: p.features?.bathrooms ?? null,
    areaTotalM2: p.features?.areaTotalM2 ? Number(p.features.areaTotalM2) : null,
    featured: p.featured,
    tenant: { name: p.tenant.name, slug: p.tenant.slug, logoUrl: p.tenant.logoUrl },
  }));

  return (
    <>
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/propiedades"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-body transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al listado
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* ── Columna izquierda: galería + info ───────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Galería */}
            <PropertyGallery
              media={property.media.map((m) => ({
                url: m.url,
                altText: m.altText,
              }))}
              title={property.title}
            />

            {/* Título y badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-md px-2.5 py-0.5 text-xs font-medium font-body ${opStyle.className}`}
                >
                  {opStyle.label}
                </span>
                <span className="rounded-md bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary font-body">
                  {zoneLabel(zone)}
                </span>
                <span className="rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground font-body">
                  {propertyTypeLabel(property.propertyType)}
                </span>
              </div>

              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground leading-tight">
                {property.title}
              </h1>

              <p className="text-2xl font-bold text-primary font-heading">
                {priceDisplay}
              </p>

              {property.location?.address && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground font-body">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {property.location.address}
                  {property.location.department &&
                    `, ${property.location.department}`}
                </p>
              )}
            </div>

            {/* Características rápidas */}
            {(property.features?.bedrooms != null ||
              property.features?.bathrooms != null ||
              property.features?.areaTotalM2 != null) && (
              <ul className="flex flex-wrap gap-x-6 gap-y-3 border-y border-border py-4">
                {property.features?.bedrooms != null && (
                  <li className="flex items-center gap-2 text-sm font-body text-foreground">
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>{property.features.bedrooms}</strong> dormitorios
                    </span>
                  </li>
                )}
                {property.features?.bathrooms != null && (
                  <li className="flex items-center gap-2 text-sm font-body text-foreground">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>{property.features.bathrooms}</strong> baños
                    </span>
                  </li>
                )}
                {property.features?.areaTotalM2 != null && (
                  <li className="flex items-center gap-2 text-sm font-body text-foreground">
                    <Maximize2 className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>{Number(property.features.areaTotalM2)}</strong> m²
                    </span>
                  </li>
                )}
              </ul>
            )}

            {/* Descripción */}
            {property.description && (
              <div className="space-y-2">
                <h2 className="font-heading font-semibold text-lg text-foreground">
                  Descripción
                </h2>
                <p className="text-sm text-foreground/80 font-body leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Grilla de características */}
            {featureItems.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-heading font-semibold text-lg text-foreground">
                  Características
                </h2>
                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {featureItems.map((f) => (
                    <div
                      key={f.label}
                      className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-secondary" />
                      <div>
                        <dt className="text-xs text-muted-foreground font-body">
                          {f.label}
                        </dt>
                        <dd className="text-sm font-semibold font-body text-foreground">
                          {f.value}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          {/* ── Columna derecha: sidebar contacto ───────────────────────────── */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            {/* Tenant info */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              {property.tenant.logoUrl ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={property.tenant.logoUrl}
                    alt={`Logo de ${property.tenant.name}`}
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 font-bold text-primary font-heading text-lg">
                  {property.tenant.name.charAt(0)}
                </span>
              )}
              <div>
                <p className="font-semibold font-heading text-sm text-foreground">
                  {property.tenant.name}
                </p>
                {property.tenant.settings?.phone && (
                  <p className="text-xs text-muted-foreground font-body">
                    {property.tenant.settings.phone}
                  </p>
                )}
              </div>
            </div>

            {/* WhatsApp (si tiene número) */}
            {whatsappNumber && (
              <WhatsAppButton
                whatsappNumber={whatsappNumber}
                message={waMessage}
                tenantId={property.tenantId}
                propertyId={property.id}
              />
            )}

            {/* Formulario de contacto */}
            <ContactForm
              tenantId={property.tenantId}
              propertyId={property.id}
              tenantName={property.tenant.name}
            />
          </div>
        </div>

        {/* ── Más propiedades de la agencia ─────────────────────────────────── */}
        {moreCards.length > 0 && (
          <section className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl text-foreground">
                Más propiedades de {property.tenant.name}
              </h2>
              <Link
                href={`/propiedades?tenant_slug=${property.tenant.slug}`}
                className="text-sm text-primary font-body hover:underline"
              >
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {moreCards.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <SiteFooter />
    </>
  );
}
