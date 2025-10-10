// middleware.ts
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*"], // ajuste si besoin
};
