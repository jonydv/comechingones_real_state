/**
 * Extiende los tipos de NextAuth/Auth.js v5 para incluir los campos
 * personalizados del JWT según Spec 04.
 *
 * JWT payload:
 * { sub, email, name, role, tenant_id, tenant_slug }
 */

import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      tenantId: string | null;
      tenantSlug: string | null;
    } & DefaultSession["user"];
  }

  // next-auth llama a esto cuando authorize() retorna el user
  interface User {
    role: UserRole;
    tenantId: string | null;
    tenantSlug: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    tenantId: string | null;
    tenantSlug: string | null;
  }
}
