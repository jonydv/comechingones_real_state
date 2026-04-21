import { handlers } from "@/auth";

// Expone GET y POST que NextAuth necesita para el flujo OAuth/Credentials
export const { GET, POST } = handlers;
