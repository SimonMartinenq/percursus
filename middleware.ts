// middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const session = await auth();
  console.log("Session", session);
  const { pathname } = req.nextUrl;

  // Si connecté et sur la page d'accueil -> /dashboard
  if (pathname === "/" && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Si non connecté et sur /dashboard -> /
  if (
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/calendar") ||
      pathname.startsWith("/tracks")) &&
    !session?.user
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Sinon, continuer normalement
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/calendar/:path*", "/tracks/:path*"], // Intercepte juste les pages concernées
};
