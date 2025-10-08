// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth-node";
export const { GET, POST } = handlers;
export const runtime = "nodejs";
