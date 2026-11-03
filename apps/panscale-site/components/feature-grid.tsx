import { RevealGroup } from "./reveal/reveal-group";
import { RevealItem } from "./reveal/reveal-item";

const features = [
  "Physics-based momentum & bounce",
  "Snap scrolling & pagination",
  "Pinch-to-zoom with proper gesture handling",
  "Works with images, canvas, WebGL, any element",
  "TypeScript-first, tree-shakeable",
  "Zero dependencies (core)"
];

export function FeatureGrid() {
  return (
    <RevealGroup className="not-prose my-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <RevealItem
          key={feature}
          className="flex items-start gap-3 rounded-xl border border-fd-border bg-fd-card p-4 text-fd-card-foreground"
        >
          <span className="mt-0.5 text-fd-primary">&#10003;</span>
          <span className="text-sm">{feature}</span>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
