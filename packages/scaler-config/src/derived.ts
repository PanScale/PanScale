import { dot } from "./dot";

export const derived = {
  installSnippetByModuleId: {
    core: "pnpm add @scaler/core",
    web: "pnpm add @scaler/web",
    react: "pnpm add @scaler/react",
    "react-native": "pnpm add @scaler/react-native"
  },
  docsDirByModuleId: {
    core: "content/docs/core",
    web: "content/docs/web",
    react: "content/docs/react",
    "react-native": "content/docs/react-native"
  }
} as const;
