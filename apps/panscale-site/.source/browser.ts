// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "core/api.mdx": () => import("../content/docs/core/api.mdx?collection=docs"), "core/getting-started.mdx": () => import("../content/docs/core/getting-started.mdx?collection=docs"), "core/index.mdx": () => import("../content/docs/core/index.mdx?collection=docs"), "react/api.mdx": () => import("../content/docs/react/api.mdx?collection=docs"), "react/getting-started.mdx": () => import("../content/docs/react/getting-started.mdx?collection=docs"), "react/index.mdx": () => import("../content/docs/react/index.mdx?collection=docs"), "react-native/api.mdx": () => import("../content/docs/react-native/api.mdx?collection=docs"), "react-native/getting-started.mdx": () => import("../content/docs/react-native/getting-started.mdx?collection=docs"), "react-native/index.mdx": () => import("../content/docs/react-native/index.mdx?collection=docs"), "web/api.mdx": () => import("../content/docs/web/api.mdx?collection=docs"), "web/getting-started.mdx": () => import("../content/docs/web/getting-started.mdx?collection=docs"), "web/index.mdx": () => import("../content/docs/web/index.mdx?collection=docs"), }),
};
export default browserCollections;