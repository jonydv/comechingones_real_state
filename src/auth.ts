/**
 * Configuración de Auth.js v5 (next-auth@beta)
 * Spec 04: Credentials provider + JWT httpOnly cookie + 7 días de expiración.
 *
 * No usamos PrismaAdapter porque empleamos JWT strategy (stateless).
 * El adapter se puede agregar en fases posteriores para OAuth (Google, etc.).
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 días (Spec 04)
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        // Buscar usuario activo (Spec 04: usuarios suspendidos → 403)
        const user = await prisma.user.findFirst({
          where: {
            email: email.toLowerCase().trim(),
            deletedAt: null,
          },
          include: {
            tenant: {
              select: { slug: true, status: true },
            },
          },
        });

        if (!user) return null;

        // Verificar contraseña con bcrypt
        const passwordOk = await bcrypt.compare(password, user.passwordHash);
        if (!passwordOk) return null;

        // Bloquear usuarios suspendidos (el proxy también lo valida, pero aquí fallamos rápido)
        if (user.status === "suspended") return null;

        // Actualizar lastLoginAt sin bloquear la respuesta
        prisma.user
          .update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })
          .catch(() => {
            // No crítico — no bloquear el login
          });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl ?? null,
          role: user.role as UserRole,
          tenantId: user.tenantId,
          tenantSlug: user.tenant?.slug ?? null,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * jwt(): se llama al crear o leer el token.
     * Inyectamos los campos extra del JWT (Spec 04).
     */
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantSlug = user.tenantSlug;
      }
      return token;
    },

    /**
     * session(): mapea el JWT a la sesión expuesta al cliente.
     * Solo enviamos campos seguros (nunca passwordHash).
     */
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
});
