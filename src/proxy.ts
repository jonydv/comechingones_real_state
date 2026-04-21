/**
 * proxy.ts — Next.js 16 (renombrado de middleware.ts en v16)
 *
 * Responsabilidades (Spec 04):
 *  1. Resolución de tenant: extrae subdominio del host header e inyecta
 *     x-tenant-slug en los request headers internos.
 *  2. Protección de rutas:
 *     - /admin/*       → requiere autenticación (AGENT, TENANT_ADMIN o SUPER_ADMIN)
 *     - /super-admin/* → requiere SUPER_ADMIN
 *     - Redirige a /login si no autenticado o sin permisos suficientes.
 */

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROLES = new Set(["AGENT", "TENANT_ADMIN", "SUPER_ADMIN"]);
const SUPER_ADMIN_ROLES = new Set(["SUPER_ADMIN"]);

// Subdominios reservados (Spec 01)
const RESERVED_SLUGS = new Set([
  "www",
  "api",
  "admin",
  "app",
  "mail",
  "ftp",
  "marketplace",
  "static",
  "assets",
]);

export default auth((req: NextRequest & { auth: { user: { role?: string } } | null }) => {
  const { pathname, hostname } = req.nextUrl;
  const session = req.auth;

  // ── 1. Resolución de tenant desde subdominio ────────────────────────────────
  // Formato esperado: [slug].marketplace.com o localhost:3000 (dev)
  const hostParts = hostname.split(".");
  const isMultiSubdomain = hostParts.length >= 3;
  const slug = isMultiSubdomain ? hostParts[0] : null;

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

    if (!SUPER_ADMIN_ROLES.has(session.user.role ?? "")) {
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

    if (!ADMIN_ROLES.has(session.user.role ?? "")) {
      return NextResponse.json(
        { error: "Acceso denegado", code: "FORBIDDEN" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  // Excluir archivos estáticos, imágenes y las rutas de NextAuth
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
