import { PrismaClient, ModuleStatus, TrackStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1) User (si existe déjà par Auth.js, on le réutilise)
  const email = "seed@exemple.com";

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

  // --- Tags de base
  const tags = await Promise.all(
    ["TypeScript", "React", "Next.js", "Node.js", "Front-End", "API"].map(
      async (name) =>
        prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        })
    )
  );

  // --- Premier parcours : "Roadmap TypeScript"
  const track1 = await prisma.track.create({
    data: {
      userId: user.id,
      title: "Roadmap TypeScript",
      description:
        "Découverte et approfondissement de TypeScript avec des projets pratiques.",
      goals:
        "Maîtriser les bases du typage, des interfaces et des génériques. Être capable de typer un projet complet.",
      status: TrackStatus.published,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // il y a 2 semaines
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // hier
    },
  });

  await prisma.trackTag.createMany({
    data: [
      {
        trackId: track1.id,
        tagId: tags.find((t) => t.name === "TypeScript")!.id,
      },
      {
        trackId: track1.id,
        tagId: tags.find((t) => t.name === "Front-End")!.id,
      },
    ],
    skipDuplicates: true,
  });

  // --- Modules du premier parcours
  const mod1 = await prisma.module.create({
    data: {
      trackId: track1.id,
      title: "Bases du Typage",
      externalUrl:
        "https://www.typescriptlang.org/docs/handbook/2/basic-types.html",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      status: ModuleStatus.done,
      position: 1,
    },
  });

  const mod2 = await prisma.module.create({
    data: {
      trackId: track1.id,
      title: "Interfaces et Classes",
      externalUrl:
        "https://www.typescriptlang.org/docs/handbook/2/classes.html",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      status: ModuleStatus.in_progress,
      position: 2,
    },
  });

  const mod3 = await prisma.module.create({
    data: {
      trackId: track1.id,
      title: "Génériques et Avancé",
      externalUrl:
        "https://www.typescriptlang.org/docs/handbook/2/generics.html",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      status: ModuleStatus.todo,
      position: 3,
    },
  });

  // --- Checks d'activité pour les modules
  await prisma.moduleCheck.createMany({
    data: [
      {
        moduleId: mod1.id,
        oldStatus: ModuleStatus.todo,
        newStatus: ModuleStatus.in_progress,
        note: "Début du module",
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
      },
      {
        moduleId: mod1.id,
        oldStatus: ModuleStatus.in_progress,
        newStatus: ModuleStatus.done,
        note: "Complété les exercices de typage",
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      },
      {
        moduleId: mod2.id,
        oldStatus: ModuleStatus.todo,
        newStatus: ModuleStatus.in_progress,
        note: "Commencé les classes",
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      },
    ],
  });

  // --- Deuxième parcours : "Roadmap React Avancée"
  const track2 = await prisma.track.create({
    data: {
      userId: user.id,
      title: "Roadmap React Avancée",
      description:
        "Approfondissement de React avec les hooks personnalisés, la gestion d’état et les bonnes pratiques.",
      goals:
        "Comprendre les hooks avancés, le contexte et optimiser les performances de rendu.",
      status: TrackStatus.draft,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
  });

  await prisma.trackTag.createMany({
    data: [
      { trackId: track2.id, tagId: tags.find((t) => t.name === "React")!.id },
      { trackId: track2.id, tagId: tags.find((t) => t.name === "Next.js")!.id },
      {
        trackId: track2.id,
        tagId: tags.find((t) => t.name === "Front-End")!.id,
      },
    ],
    skipDuplicates: true,
  });

  const modA = await prisma.module.create({
    data: {
      trackId: track2.id,
      title: "Hooks avancés",
      externalUrl: "https://react.dev/reference/react",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      status: ModuleStatus.in_progress,
      position: 1,
    },
  });

  const modB = await prisma.module.create({
    data: {
      trackId: track2.id,
      title: "Context et Reducer",
      externalUrl:
        "https://react.dev/learn/scaling-up-with-reducer-and-context",
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
      status: ModuleStatus.todo,
      position: 2,
    },
  });

  await prisma.moduleCheck.createMany({
    data: [
      {
        moduleId: modA.id,
        oldStatus: ModuleStatus.todo,
        newStatus: ModuleStatus.in_progress,
        note: "Découverte des hooks personnalisés",
        changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      },
    ],
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
