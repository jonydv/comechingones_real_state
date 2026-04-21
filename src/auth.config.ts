/**
 * auth.config.ts — Configuración Edge-safe de NextAuth v5.
 *
 * Este archivo NO importa Prisma ni bcrypt.
 * Es compartido entre:
 *  - src/auth.ts      (añade el Credentials provider + Prisma)
 *  - src/proxy.ts     (solo necesita JWT para proteger rutas)
 */

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Providers se añaden en src/auth.ts (Credentials requiere Prisma + bcrypt)
  providers: [],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantSlug = user.tenantSlug;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.tenantSlug = token.tenantSlug;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
