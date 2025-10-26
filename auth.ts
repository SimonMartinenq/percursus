import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [GitHub],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Après connexion, redirige vers /dashboard
      if (url.startsWith("/")) return `${baseUrl}/dashboard`;
      return baseUrl;
    },
  },
});
