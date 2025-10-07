import { PrismaClient, ModuleStatus, TrackStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1) User (si existe déjà par Auth.js, on le réutilise)
  const email = "seed@example.com";

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: "Seed User",
        image: "https://avatars.githubusercontent.com/u/1?v=4", // optionnel
      },
    });
  }

  // 2) Track (parcours)
  const track = await prisma.track.create({
    data: {
      userId: user.id,
      title: "Apprendre TypeScript en 7 jours",
      description:
        "Parcours rapide pour monter en compétences sur TypeScript avec ressources externes.",
      goals:
        "Comprendre les types, generics, utility types; config tsconfig; intégrer TS dans Next.js.",
      status: TrackStatus.published,
      modules: {
        create: [
          {
            title: "Intro & Types de base",
            externalUrl:
              "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
            startDate: new Date(),
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            status: ModuleStatus.in_progress,
            position: 1,
          },
          {
            title: "Generics & Utility Types",
            externalUrl:
              "https://www.typescriptlang.org/docs/handbook/2/generics.html",
            startDate: new Date(),
            dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            status: ModuleStatus.todo,
            position: 2,
          },
          {
            title: "TS avec Next.js",
            externalUrl:
              "https://nextjs.org/docs/app/building-your-application/configuring/typescript",
            startDate: new Date(),
            dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
            status: ModuleStatus.todo,
            position: 3,
          },
        ],
      },
    },
    include: { modules: true },
  });

  // 3) Historisation (ModuleCheck) – optionnel
  const firstModule = track.modules[0];
  await prisma.moduleCheck.create({
    data: {
      moduleId: firstModule.id,
      oldStatus: "todo",
      newStatus: firstModule.status,
      note: "Module démarré lors du seed",
    },
  });

  // 4) Tags (optionnel)
  const tagTs = await prisma.tag.upsert({
    where: { name: "TypeScript" },
    update: {},
    create: { name: "TypeScript" },
  });
  await prisma.trackTag.upsert({
    where: {
      trackId_tagId: { trackId: track.id, tagId: tagTs.id },
    },
    update: {},
    create: {
      trackId: track.id,
      tagId: tagTs.id,
    },
  });

  // 5) Reminder (optionnel)
  await prisma.reminder.create({
    data: {
      userId: user.id,
      trackId: track.id,
      moduleId: firstModule.id,
      runAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      message: "Pense à avancer sur le module 1 !",
    },
  });

  console.log("Seed terminé ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
