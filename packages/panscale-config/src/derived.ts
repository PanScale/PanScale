import { dot } from "./dot";

export const derived = {
  installSnippetByModuleId: {
    core: "pnpm add @panscale/core",
    web: "pnpm add @panscale/web",
    react: "pnpm add @panscale/react",
    "react-native": "pnpm add @panscale/react-native"
  },
  docsDirByModuleId: {
    core: "content/docs/core",
    web: "content/docs/web",
    react: "content/docs/react",
    "react-native": "content/docs/react-native"
  }
} as const;
