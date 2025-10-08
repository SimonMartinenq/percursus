// auth-edge.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

// IMPORTANT : pas d'adapter ici, et sessions JWT
export const { auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [GitHub],
});
