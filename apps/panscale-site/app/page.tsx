import Link from "next/link";
import { dot } from "@panscale/config";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16">
      <section className="flex flex-col gap-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground">
          panscale
        </p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{dot.project.title}</h1>
        <p className="max-w-2xl text-lg text-fd-muted-foreground">{dot.project.description}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/docs"
            className="rounded-full bg-fd-primary px-5 py-2 text-sm font-semibold text-fd-primary-foreground"
          >
            View docs
          </Link>
          <Link
            href="/playground"
            className="rounded-full bg-fd-primary px-5 py-2 text-sm font-semibold text-fd-primary-foreground"
          >
            Playground
          </Link>
          {dot.project.links.github.state === "configured" && (
            <Link
              href={dot.project.links.github.url}
              className="rounded-full border border-fd-border px-5 py-2 text-sm font-semibold"
            >
              GitHub
            </Link>
          )}
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dot.modules.map((mod) => (
          <div key={mod.id} className="rounded-2xl border border-fd-border bg-fd-card p-5">
            <h2 className="text-lg font-semibold">{mod.title}</h2>
            <p className="mt-2 text-sm text-fd-muted-foreground">{mod.description}</p>
            <Link href={"/docs/" + mod.id} className="mt-4 inline-flex text-sm font-semibold text-fd-primary">
              Explore docs →
            </Link>
          </div>
        ))}
      </section>
      <footer className="border-t border-fd-border pt-6 text-sm text-fd-muted-foreground">
        <a href="/llms.txt">llms.txt</a>
      </footer>
    </main>
  );
}
