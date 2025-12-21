import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!adminPassword || !nextAuthSecret) {
  console.warn("ADMIN_PASSWORD and NEXTAUTH_SECRET must be set for admin auth.");
}

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email", value: adminEmail ?? "admin@example.com" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const emailOk = adminEmail ? credentials?.email === adminEmail : true;
        const passwordOk = credentials?.password === adminPassword;
        if (emailOk && passwordOk) {
          return { id: "admin", email: credentials?.email ?? "admin@example.com", role: "admin" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
};
