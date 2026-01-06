import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const adminEmail = process.env.ADMIN_EMAIL;
const adminEmails = (process.env.ADMIN_EMAILS ?? adminEmail ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
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
        email: {
          label: "Email",
          type: "email",
          value: adminEmails[0] ?? adminEmail ?? "admin@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const emailOk = adminEmails.length
          ? adminEmails.includes((credentials?.email ?? "").toLowerCase())
          : true;
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
