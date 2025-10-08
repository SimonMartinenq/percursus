// auth-node.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Tu peux garder "database" ou passer en "jwt"
  // session: { strategy: "database" },
  providers: [GitHub],
});
