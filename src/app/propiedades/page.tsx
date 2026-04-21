/**
 * /propiedades — Listado con filtros y paginación
 * Server Component: datos del DB en el server, filtros interactivos en client islands.
 * searchParams es una Promise en Next.js 16 → se debe hacer await.
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PropertyCard, { type PropertyCardData } from "@/components/PropertyCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PropertyFilters from "./PropertyFilters";
import PropertySort from "./PropertySort";
import Pagination from "./Pagination";
import type {
  OperationType,
  PropertyType,
  ComechingoneZone,
  Prisma,
} from "@prisma/client";
import { zoneLabel, operationStyle } from "@/lib/formatters";

// ─── Metadata dinámica (Spec 07) ─────────────────────────────────────────────

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const zone = sp.zone ? zoneLabel(sp.zone) : null;
  const op = sp.operation_type ? operationStyle(sp.operation_type).label : null;

  const parts = ["Propiedades", zone, op].filter(Boolean);
  const title = parts.join(" en ") + " — Horizonte Comechingones";

  return {
    title,
    description:
      "Encontrá casas, cabañas y terrenos en el Corredor de los Comechingones, San Luis.",
  };
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const PER_PAGE = 12;

// ─── Helpers de query ─────────────────────────────────────────────────────────

function buildWhere(sp: Record<string, string>): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {
    status: "disponible",
    deletedAt: null,
    tenant: { status: "active" },
  };

  if (sp.zone) {
    where.location = { zone: sp.zone as ComechingoneZone };
  }
  if (sp.operation_type) {
    where.operationType = sp.operation_type as OperationType;
  }
  if (sp.property_type) {
    where.propertyType = sp.property_type as PropertyType;
  }
  if (sp.bedrooms_min) {
    where.features = { bedrooms: { gte: Number(sp.bedrooms_min) } };
  }
  if (sp.price_min || sp.price_max) {
    const priceFilter: Prisma.DecimalNullableFilter = {};
    if (sp.price_min) priceFilter.gte = Number(sp.price_min);
    if (sp.price_max) priceFilter.lte = Number(sp.price_max);
    where.OR = [{ price: priceFilter }, { pricePerNight: priceFilter }];
  }

  return where;
}

function buildOrderBy(sort: string): Prisma.PropertyOrderByWithRelationInput {
  if (sort === "precio_asc") return { price: "asc" };
  if (sort === "precio_desc") return { price: "desc" };
  return { publishedAt: "desc" };
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function PropiedadesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page) || 1);
  const sort = sp.sort ?? "reciente";
  const where = buildWhere(sp);
  const orderBy = buildOrderBy(sort);

  // Run count + data in parallel
  const [total, properties] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      orderBy,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        tenant: { select: { name: true, slug: true, logoUrl: true } },
        location: { select: { zone: true } },
        features: { select: { bedrooms: true, bathrooms: true, areaTotalM2: true } },
        media: {
          where: { isCover: true },
          select: { url: true },
          take: 1,
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  // Map DB result → PropertyCardData
  const cards: PropertyCardData[] = properties.map((p) => ({
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
    tenant: {
      name: p.tenant.name,
      slug: p.tenant.slug,
      logoUrl: p.tenant.logoUrl,
    },
  }));

  return (
    <>
      <SiteHeader />

      {/* ── Header de sección ─────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="font-heading font-bold text-2xl text-foreground">
            Propiedades en venta y alquiler
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-body">
            Corredor de los Comechingones, San Luis
          </p>
        </div>
      </div>

      {/* ── Layout principal ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Sidebar de filtros */}
          <Suspense fallback={<div className="w-full lg:w-64 h-96 rounded-xl bg-muted animate-pulse" />}>
            <PropertyFilters />
          </Suspense>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Sort bar */}
            <Suspense fallback={null}>
              <PropertySort total={total} />
            </Suspense>

            {/* Grid de propiedades */}
            {cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
                <p className="text-lg font-semibold font-heading text-foreground">
                  No encontramos propiedades
                </p>
                <p className="mt-2 text-sm text-muted-foreground font-body">
                  Probá ajustando los filtros de búsqueda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}

            {/* Paginación */}
            <Suspense fallback={null}>
              <Pagination currentPage={page} totalPages={totalPages} />
            </Suspense>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
