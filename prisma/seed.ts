/**
 * Seed de datos para desarrollo local.
 * Ejecutar con: npm run prisma:seed
 *
 * Crea:
 *  - 1 Tenant demo (Horizonte Comechingones)
 *  - 1 SUPER_ADMIN sin tenant
 *  - 1 TENANT_ADMIN del tenant demo
 *  - 2 propiedades disponibles con ubicación, features y media
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definida. Verifica tu archivo .env");
  }
  // Para seed local usamos pg (TCP nativo) en lugar del driver serverless de Neon
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("🌱 Iniciando seed...");

  // ─── Tenant ────────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "horizonte-comechingones" },
    update: {},
    create: {
      name: "Horizonte Comechingones",
      slug: "horizonte-comechingones",
      primaryColor: "#14354D",
      secondaryColor: "#DEAB5E",
      plan: "pro",
      status: "active",
      settings: {
        create: {
          description:
            "Agencia inmobiliaria especializada en el Corredor de los Comechingones, San Luis. Cabañas, casas, terrenos y propiedades comerciales.",
          phone: "+54 266 412-3456",
          whatsapp: "5492664123456",
          email: "contacto@horizontecomechingones.com.ar",
          address: "Av. del Fundador 320, Villa de Merlo, San Luis",
          instagramUrl: "https://instagram.com/horizontecomechingones",
          businessHours: { "lun-vie": "9-18", sab: "9-13" },
          metaTitle:
            "Horizonte Comechingones — Inmobiliaria en Merlo y la región serrana",
          metaDescription:
            "Encontrá tu propiedad en el Corredor de los Comechingones. Cabañas, casas, terrenos y más en Merlo, La Florida, El Trapiche y toda la región de San Luis.",
        },
      },
    },
    include: { settings: true },
  });
  console.log(`✓ Tenant: ${tenant.name} (${tenant.slug})`);

  // ─── SUPER_ADMIN ───────────────────────────────────────────────────────────
  const superAdminHash = await bcrypt.hash("SuperAdmin123!", SALT_ROUNDS);
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@marketplace.com" },
    update: {},
    create: {
      email: "superadmin@marketplace.com",
      passwordHash: superAdminHash,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      status: "active",
      tenantId: null,
    },
  });
  console.log(`✓ SUPER_ADMIN: ${superAdmin.email}`);

  // ─── TENANT_ADMIN ──────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin123!", SALT_ROUNDS);
  const tenantAdmin = await prisma.user.upsert({
    where: { email: "admin@horizontecomechingones.com.ar" },
    update: {},
    create: {
      email: "admin@horizontecomechingones.com.ar",
      passwordHash: adminHash,
      name: "María González",
      role: "TENANT_ADMIN",
      status: "active",
      tenantId: tenant.id,
    },
  });
  console.log(`✓ TENANT_ADMIN: ${tenantAdmin.email}`);

  // ─── AGENT ─────────────────────────────────────────────────────────────────
  const agentHash = await bcrypt.hash("Agent123!", SALT_ROUNDS);
  const agent = await prisma.user.upsert({
    where: { email: "carlos@horizontecomechingones.com.ar" },
    update: {},
    create: {
      email: "carlos@horizontecomechingones.com.ar",
      passwordHash: agentHash,
      name: "Carlos Rodríguez",
      role: "AGENT",
      status: "active",
      tenantId: tenant.id,
    },
  });
  console.log(`✓ AGENT: ${agent.email}`);

  // ─── Propiedad 1: Cabaña en La Florida ────────────────────────────────────
  const prop1 = await prisma.property.upsert({
    where: { id: "seed-prop-001-0000-0000-000000000001" },
    update: {},
    create: {
      id: "seed-prop-001-0000-0000-000000000001",
      tenantId: tenant.id,
      agentId: agent.id,
      title: "Cabaña en La Florida con vista al río",
      description:
        "Hermosa cabaña de montaña ubicada a orillas del arroyo en La Florida. Ideal para turismo o como inversión en alquiler temporario. Cuenta con amplios espacios verdes, parrilla techada y acceso directo al agua. A solo 20 minutos de la ciudad de San Luis.",
      price: null,
      pricePerNight: 25000,
      currency: "ARS",
      operationType: "alquiler_temporario",
      propertyType: "cabana",
      status: "disponible",
      featured: true,
      viewsCount: 142,
      publishedAt: new Date("2026-03-01T10:00:00Z"),
      location: {
        create: {
          zone: "la_florida",
          department: "Pringles",
          address: "Camino al Río s/n, La Florida",
          lat: -33.1523,
          lng: -66.4012,
          showExactLocation: false,
        },
      },
      features: {
        create: {
          bedrooms: 2,
          bathrooms: 1,
          areaTotalM2: 80,
          areaCoveredM2: 55,
          garage: false,
          pool: false,
          furnished: true,
          allowsPets: true,
          hasWifi: true,
          hasBbq: true,
          stories: 1,
          yearBuilt: 2018,
          additionalFeatures: ["Vista al arroyo", "Leñero", "Quincho"],
        },
      },
      media: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
            type: "image",
            order: 0,
            isCover: true,
            altText: "Vista frontal de la cabaña con el arroyo al fondo",
          },
          {
            url: "https://images.unsplash.com/photo-1449247666642-264389f5f5b1?w=1920&q=80",
            type: "image",
            order: 1,
            isCover: false,
            altText: "Interior de la cabaña — sala principal",
          },
        ],
      },
    },
  });
  console.log(`✓ Propiedad 1: ${prop1.title}`);

  // ─── Propiedad 2: Casa en Merlo ────────────────────────────────────────────
  const prop2 = await prisma.property.upsert({
    where: { id: "seed-prop-002-0000-0000-000000000002" },
    update: {},
    create: {
      id: "seed-prop-002-0000-0000-000000000002",
      tenantId: tenant.id,
      agentId: tenantAdmin.id,
      title: "Casa con pileta en Villa de Merlo — barrio cerrado",
      description:
        "Casa moderna de 4 dormitorios en barrio cerrado privado de Villa de Merlo. Amplio jardín con pileta climatizada, cochera doble y asador. A 5 cuadras del microcentro de Merlo. Ideal para familia numerosa o inversión. Documentación en orden, escritura lista.",
      price: 120000,
      pricePerNight: null,
      currency: "USD",
      operationType: "venta",
      propertyType: "casa",
      status: "disponible",
      featured: true,
      viewsCount: 287,
      publishedAt: new Date("2026-02-15T14:00:00Z"),
      location: {
        create: {
          zone: "merlo",
          department: "Junín",
          address: "Los Robles 847, Barrio Los Condores, Villa de Merlo",
          lat: -32.3518,
          lng: -65.0127,
          showExactLocation: true,
        },
      },
      features: {
        create: {
          bedrooms: 4,
          bathrooms: 3,
          areaTotalM2: 600,
          areaCoveredM2: 220,
          garage: true,
          pool: true,
          furnished: false,
          allowsPets: true,
          hasWifi: false,
          hasBbq: true,
          stories: 2,
          yearBuilt: 2021,
          additionalFeatures: [
            "Barrio cerrado",
            "Cochera doble",
            "Pileta climatizada",
            "Jardín paisajístico",
          ],
        },
      },
      media: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
            type: "image",
            order: 0,
            isCover: true,
            altText: "Fachada de la casa con jardín y pileta",
          },
          {
            url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80",
            type: "image",
            order: 1,
            isCover: false,
            altText: "Pileta exterior con deck de madera",
          },
          {
            url: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1920&q=80",
            type: "image",
            order: 2,
            isCover: false,
            altText: "Living-comedor abierto con vista al jardín",
          },
        ],
      },
    },
  });
  console.log(`✓ Propiedad 2: ${prop2.title}`);

  console.log("\n✅ Seed completado exitosamente.");
  console.log("\n📋 Credenciales de prueba:");
  console.log("  SUPER_ADMIN → superadmin@marketplace.com / SuperAdmin123!");
  console.log(
    "  TENANT_ADMIN → admin@horizontecomechingones.com.ar / Admin123!"
  );
  console.log(
    "  AGENT        → carlos@horizontecomechingones.com.ar / Agent123!"
  );
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  });
