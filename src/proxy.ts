/**
 * proxy.ts — Next.js 16 (renombrado de middleware.ts en v16)
 *
 * Responsabilidades (Spec 04):
 *  1. Resolución de tenant: extrae subdominio e inyecta x-tenant-slug.
 *  2. Protección de rutas /admin/* y /super-admin/* con JWT-only (sin Prisma).
 *
 * Exporta `proxy` como export nombrado (requerido por Next.js 16).
 * Usa authConfig (Edge-safe) — Prisma solo corre en Server Components.
 */

import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const ADMIN_ROLES = new Set(["AGENT", "TENANT_ADMIN", "SUPER_ADMIN"]);
const SUPER_ADMIN_ROLES = new Set(["SUPER_ADMIN"]);

const RESERVED_SLUGS = new Set([
  "www", "api", "admin", "app", "mail",
  "ftp", "marketplace", "static", "assets",
]);

export const proxy = auth((req) => {
  const { pathname, hostname } = req.nextUrl;
  const session = req.auth;

  // ── 1. Tenant slug desde subdominio ─────────────────────────────────────────
  const hostParts = hostname.split(".");
  const slug = hostParts.length >= 3 ? hostParts[0] : null;

  const requestHeaders = new Headers(req.headers);
  if (slug && !RESERVED_SLUGS.has(slug)) {
    requestHeaders.set("x-tenant-slug", slug);
  }

  // ── 2. Protección /super-admin/* ─────────────────────────────────────────────
  if (pathname.startsWith("/super-admin")) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const role = session.user.role ?? "";
    if (!SUPER_ADMIN_ROLES.has(role)) {
      return NextResponse.json(
        { error: "Acceso denegado", code: "FORBIDDEN" },
        { status: 403 }
      );
    }
  }

  // ── 3. Protección /admin/* ────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const role = session.user.role ?? "";
    if (!ADMIN_ROLES.has(role)) {
      return NextResponse.json(
        { error: "Acceso denegado", code: "FORBIDDEN" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
