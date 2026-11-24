import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

// Static export: the search index is written to out/api/search at build time,
// and the client fetches it (RootProvider search type "static").
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source);
