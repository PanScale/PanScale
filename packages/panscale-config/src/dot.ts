import { DotSchema, type Dot } from "./dot.schema";

export const dot = DotSchema.parse({
  schemaVersion: 1,
  project: {
    id: "panscale",
    title: "Panscale",
    description: "Pan/zoom/scroll transformation library for any JS runtime.",
    links: {
      github: {
        state: "configured",
        url: "https://github.com/PanScale/PanScale"
      }
    }
  },
  publishing: {
    scope: "@panscale",
    nodeEngines: ">=20",
    license: "MIT"
  },
  modules: [
    {
      id: "core",
      title: "Core",
      description: "Runtime-agnostic pan/zoom/scroll engine powered by transformation-matrix.",
      npm: {
        name: "@panscale/core",
        distTag: "latest"
      },
      folder: {
        packageDir: "packages/panscale-core",
        docsDir: "apps/panscale-site/content/docs/core"
      },
      kind: "core",
      platforms: ["universal"],
      stability: "stable",
      links: {
        kind: "links",
        items: [
          {
            label: "npm",
            href: "https://www.npmjs.com/package/@panscale/core"
          }
        ]
      },
      announcements: [
        {
          title: "Welcome",
          body: "Replace this announcement with real release notes."
        }
      ],
      upstreamDocs: [
        {
          label: "transformation-matrix",
          href: "https://github.com/chrvadala/transformation-matrix"
        }
      ]
    },
    {
      id: "web",
      title: "Web",
      description: "DOM event adapter for @panscale/core — mouse, touch, wheel, pointer.",
      npm: {
        name: "@panscale/web",
        distTag: "latest"
      },
      folder: {
        packageDir: "packages/panscale-web",
        docsDir: "apps/panscale-site/content/docs/web"
      },
      kind: "integration",
      platforms: ["browser"],
      stability: "stable",
      links: {
        kind: "links",
        items: [
          {
            label: "npm",
            href: "https://www.npmjs.com/package/@panscale/web"
          }
        ]
      },
      announcements: [
        {
          title: "Welcome",
          body: "Replace this announcement with real release notes."
        }
      ],
      upstreamDocs: []
    },
    {
      id: "react",
      title: "React",
      description: "React hooks and components for @panscale/core.",
      npm: {
        name: "@panscale/react",
        distTag: "latest"
      },
      folder: {
        packageDir: "packages/panscale-react",
        docsDir: "apps/panscale-site/content/docs/react"
      },
      kind: "integration",
      platforms: ["react"],
      stability: "stable",
      links: {
        kind: "links",
        items: [
          {
            label: "npm",
            href: "https://www.npmjs.com/package/@panscale/react"
          }
        ]
      },
      announcements: [
        {
          title: "Welcome",
          body: "Replace this announcement with real release notes."
        }
      ],
      upstreamDocs: [
        {
          label: "React",
          href: "https://react.dev"
        }
      ]
    },
    {
      id: "react-native",
      title: "React Native",
      description: "React Native adapter for @panscale/core with Animated transforms.",
      npm: {
        name: "@panscale/react-native",
        distTag: "latest"
      },
      folder: {
        packageDir: "packages/panscale-react-native",
        docsDir: "apps/panscale-site/content/docs/react-native"
      },
      kind: "integration",
      platforms: ["react-native"],
      stability: "stable",
      links: {
        kind: "links",
        items: [
          {
            label: "npm",
            href: "https://www.npmjs.com/package/@panscale/react-native"
          }
        ]
      },
      announcements: [
        {
          title: "Welcome",
          body: "Replace this announcement with real release notes."
        }
      ],
      upstreamDocs: [
        {
          label: "React Native",
          href: "https://reactnative.dev"
        }
      ]
    }
  ],
  docs: {
    orphanMode: "warn",
    apiDocs: "enabled"
  }
} satisfies Dot);
