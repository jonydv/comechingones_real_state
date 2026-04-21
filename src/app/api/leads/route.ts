/**
 * POST /api/leads — Crea un nuevo lead (Spec 05)
 *
 * Reglas de negocio:
 * 1. Requerido: name + (email | phone)
 * 2. tenant_id debe corresponder a un tenant active
 * 3. Si se provee property_id, debe pertenecer al mismo tenant
 * 4. WhatsApp leads solo requieren name + source (no validamos email/phone)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const {
    tenantId,
    propertyId,
    name,
    email,
    phone,
    message,
    source = "web_form",
  } = body as Record<string, string | null | undefined>;

  // Validaciones básicas
  if (!tenantId || typeof tenantId !== "string") {
    return NextResponse.json({ error: "tenant_id requerido" }, { status: 400 });
  }
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }
  if (source === "web_form" && !email && !phone) {
    return NextResponse.json(
      { error: "Se requiere al menos email o teléfono" },
      { status: 400 }
    );
  }

  // Verificar tenant activo (Spec 05 rule 2: si no existe o no está activo → 404)
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, status: true },
  });

  if (!tenant || tenant.status !== "active") {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  // Verificar propiedad (si se provee) pertenece al tenant (Spec 05 rule 3)
  let resolvedPropertyId: string | null = null;
  let agentId: string | null = null;

  if (propertyId && typeof propertyId === "string") {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, tenantId: true, agentId: true },
    });

    if (!property || property.tenantId !== tenantId) {
      return NextResponse.json(
        { error: "Propiedad no pertenece a este tenant" },
        { status: 400 }
      );
    }

    resolvedPropertyId = property.id;
    agentId = property.agentId; // Lead hereda el agente de la propiedad (Spec 05 rule 8)
  }

  const lead = await prisma.lead.create({
    data: {
      tenantId,
      propertyId: resolvedPropertyId,
      agentId,
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      message: message?.trim() || null,
      source: source === "whatsapp" ? "whatsapp" : "web_form",
      status: "nuevo",
    },
    select: { id: true },
  });

  return NextResponse.json(
    { id: lead.id, message: "Tu consulta fue enviada exitosamente." },
    { status: 201 }
  );
}
