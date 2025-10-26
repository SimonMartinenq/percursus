import Link from "next/link";
import { LoginButton } from "@/components/LoginButton";

export default async function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header public */}
      <header className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="text-xl font-semibold">Percurus</div>
          <nav className="flex items-center gap-4">
            <Link
              href="/#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Fonctionnalités
            </Link>
            <Link
              href="/#pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Tarifs
            </Link>
            <LoginButton />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center text-center px-6 py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Suivez vos formations, restez motivé, progressez.
          </h1>
          <p className="text-muted-foreground text-lg">
            Percurus vous aide à structurer vos parcours d’apprentissage, suivre
            vos progrès, et atteindre vos objectifs étape par étape.
          </p>
          <div className="flex justify-center gap-4">
            <LoginButton />
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="max-w-6xl mx-auto py-16 px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {[
          {
            title: "Suivi intelligent",
            desc: "Visualisez vos progrès module par module et vos objectifs à venir.",
          },
          {
            title: "Rappels automatiques",
            desc: "Recevez des notifications avant chaque échéance importante.",
          },
          {
            title: "Analyse de performance",
            desc: "Identifiez vos points forts et axes d'amélioration grâce aux statistiques.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="border rounded-lg p-6 hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Percurus — Suivi de formation en ligne
      </footer>
    </div>
  );
}
