import { DotSchema, type Dot } from "./dot.schema";

export const dot = DotSchema.parse({
  schemaVersion: 1,
  project: {
    id: "scaler",
    title: "Scaler",
    description: "Pan/zoom/scroll transformation library for any JS runtime.",
    links: {
      github: {
        state: "configured",
        url: "https://github.com/ScalerNpm/ScalerMonorepo"
      }
    }
  },
  publishing: {
    scope: "@scaler",
    nodeEngines: ">=20",
    license: "MIT"
  },
  modules: [
    {
      id: "core",
      title: "Core",
      description: "Runtime-agnostic pan/zoom/scroll engine powered by transformation-matrix.",
      npm: {
        name: "@scaler/core",
        distTag: "latest"
      },
      folder: {
        packageDir: "packages/scaler-core",
        docsDir: "apps/scaler-site/content/docs/core"
      },
      kind: "core",
      platforms: ["universal"],
      stability: "stable",
      links: {
        kind: "links",
        items: [
          {
            label: "npm",
            href: "https://www.npmjs.com/package/@scaler/core"
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
      description: "DOM event adapter for @scaler/core — mouse, touch, wheel, pointer.",
      npm: {
        name: "@scaler/web",
        distTag: "latest"
      },
      folder: {
        packageDir: "packages/scaler-web",
        docsDir: "apps/scaler-site/content/docs/web"
      },
      kind: "integration",
      platforms: ["browser"],
      stability: "stable",
      links: {
        kind: "links",
        items: [
          {
            label: "npm",
            href: "https://www.npmjs.com/package/@scaler/web"
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
      description: "React hooks and components for @scaler/core.",
      npm: {
        name: "@scaler/react",
        distTag: "latest"
      },
      folder: {
        packageDir: "packages/scaler-react",
        docsDir: "apps/scaler-site/content/docs/react"
      },
      kind: "integration",
      platforms: ["react"],
      stability: "stable",
      links: {
        kind: "links",
        items: [
          {
            label: "npm",
            href: "https://www.npmjs.com/package/@scaler/react"
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
      description: "React Native adapter for @scaler/core with Animated transforms.",
      npm: {
        name: "@scaler/react-native",
        distTag: "latest"
      },
      folder: {
        packageDir: "packages/scaler-react-native",
        docsDir: "apps/scaler-site/content/docs/react-native"
      },
      kind: "integration",
      platforms: ["react-native"],
      stability: "stable",
      links: {
        kind: "links",
        items: [
          {
            label: "npm",
            href: "https://www.npmjs.com/package/@scaler/react-native"
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
