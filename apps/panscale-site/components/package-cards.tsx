import Link from "next/link";

import config from "../site.config";
import { RevealGroup } from "./reveal/reveal-group";
import { RevealItem } from "./reveal/reveal-item";

const npmModules = config.sections.npm?.modules ?? [];

/** One card per published package, from the modules in site.config.ts: its docs page and its npm page. */
export function PackageCards() {
  return (
    <RevealGroup className="not-prose my-8 grid gap-4 sm:grid-cols-2">
      {npmModules.map((mod) => {
        const npmLink = mod.links.kind === "links" ? mod.links.items.find((item) => item.label === "npm") : undefined;
        return (
          <RevealItem key={mod.id} className="rounded-2xl border border-fd-border bg-fd-card p-5 text-fd-card-foreground">
            <code className="text-sm font-semibold">{mod.npm.name}</code>
            <p className="mt-2 text-sm text-fd-muted-foreground">{mod.description}</p>
            <div className="mt-3 flex gap-4">
              <Link href={`/docs/${mod.id}`} className="text-sm font-semibold text-fd-primary">
                Docs →
              </Link>
              {npmLink === undefined ? null : (
                <a href={npmLink.href} className="text-sm text-fd-muted-foreground hover:text-fd-foreground">
                  npm
                </a>
              )}
            </div>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
