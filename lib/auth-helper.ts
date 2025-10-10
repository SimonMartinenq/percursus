import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.name) {
    throw new Error("Non authentifié");
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: session.user.email ?? undefined },
  });
  if (!user) {
    throw new Error("User not found");
  }
  console.log("CHECK session", session.user.email, user.email);
  return user;
}
