import { dot } from "@panscale/config";

export function GET() {
  const base = dot.project.links.github.state === "configured" ? "" : "";

  const moduleLines = dot.modules
    .map((mod) => `- [${mod.title}](/docs/${mod.id}): ${mod.description}`)
    .join("\n");

  const apiLines = dot.docs.apiDocs === "enabled"
    ? dot.modules
        .map((mod) => `- [${mod.title} API Reference](/docs/${mod.id}/api)`)
        .join("\n")
    : "";

  const content = [
    "# " + dot.project.title,
    "",
    "> " + dot.project.description,
    "",
    "## Docs",
    "",
    moduleLines,
    ...(apiLines ? ["", "## API Reference", "", apiLines] : []),
    ""
  ].join("\n");

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
