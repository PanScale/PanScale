// @ts-nocheck
import * as __fd_glob_12 from "../content/docs/web/index.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/web/getting-started.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/web/api.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/react-native/index.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/react-native/getting-started.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/react-native/api.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/react/index.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/react/getting-started.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/react/api.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/core/index.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/core/getting-started.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/core/api.mdx?collection=docs"
import * as __fd_glob_0 from "../content/docs/index.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {}, {"index.mdx": __fd_glob_0, "core/api.mdx": __fd_glob_1, "core/getting-started.mdx": __fd_glob_2, "core/index.mdx": __fd_glob_3, "react/api.mdx": __fd_glob_4, "react/getting-started.mdx": __fd_glob_5, "react/index.mdx": __fd_glob_6, "react-native/api.mdx": __fd_glob_7, "react-native/getting-started.mdx": __fd_glob_8, "react-native/index.mdx": __fd_glob_9, "web/api.mdx": __fd_glob_10, "web/getting-started.mdx": __fd_glob_11, "web/index.mdx": __fd_glob_12, });