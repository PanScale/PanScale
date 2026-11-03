import { defineSite } from "@byoklab/site-config";

const links = (name: string) => ({
  kind: "links" as const,
  items: [{ label: "npm", href: `https://www.npmjs.com/package/${name}` }]
});

export default defineSite({
  schemaVersion: 1,
  name: "Panscale",
  description: "Pan/zoom/scroll transformation library for any JS runtime.",
  siteUrl: "https://panscale.yatsyk.com",
  projectId: "panscale",
  kind: "docs",
  // A public site: no preset, so the public theme (and the Umami host below, which a preset would supply).
  index: true,
  links: { github: "PanScale/PanScale" },
  // Public ingest ids (Umami website "panscale", GlitchTip project "panscale").
  telemetry: {
    umami: "95f68b81-ed0a-43f7-b26c-c49a911be4d4",
    umamiHost: "https://stats.i.byokapi.com",
    glitchtip: "https://abc750b50fdc4772a7bd358ad2ba8e4b@errors.i.byokapi.com/6"
  },
  sections: {
    npm: {
      modules: [
        {
          id: "core",
          title: "Core",
          description: "Runtime-agnostic pan/zoom/scroll engine powered by transformation-matrix.",
          npm: { name: "@panscale/core", distTag: "latest" },
          folder: { packageDir: "packages/panscale-core", docsDir: "apps/panscale-site/content/docs/core" },
          kind: "core",
          platforms: ["universal"],
          stability: "stable",
          links: links("@panscale/core"),
          announcements: [{ title: "Welcome", body: "Replace this announcement with real release notes." }],
          upstreamDocs: [{ label: "transformation-matrix", href: "https://github.com/chrvadala/transformation-matrix" }]
        },
        {
          id: "web",
          title: "Web",
          description: "DOM event adapter for @panscale/core — mouse, touch, wheel, pointer.",
          npm: { name: "@panscale/web", distTag: "latest" },
          folder: { packageDir: "packages/panscale-web", docsDir: "apps/panscale-site/content/docs/web" },
          kind: "integration",
          platforms: ["browser"],
          stability: "stable",
          links: links("@panscale/web"),
          announcements: [{ title: "Welcome", body: "Replace this announcement with real release notes." }],
          upstreamDocs: []
        },
        {
          id: "react",
          title: "React",
          description: "React hooks and components for @panscale/core.",
          npm: { name: "@panscale/react", distTag: "latest" },
          folder: { packageDir: "packages/panscale-react", docsDir: "apps/panscale-site/content/docs/react" },
          kind: "integration",
          platforms: ["react"],
          stability: "stable",
          links: links("@panscale/react"),
          announcements: [{ title: "Welcome", body: "Replace this announcement with real release notes." }],
          upstreamDocs: [{ label: "React", href: "https://react.dev" }]
        },
        {
          id: "react-native",
          title: "React Native",
          description: "React Native adapter for @panscale/core with Animated transforms.",
          npm: { name: "@panscale/react-native", distTag: "latest" },
          folder: { packageDir: "packages/panscale-react-native", docsDir: "apps/panscale-site/content/docs/react-native" },
          kind: "integration",
          platforms: ["react-native"],
          stability: "stable",
          links: links("@panscale/react-native"),
          announcements: [{ title: "Welcome", body: "Replace this announcement with real release notes." }],
          upstreamDocs: [{ label: "React Native", href: "https://reactnative.dev" }]
        }
      ]
    }
  }
});
