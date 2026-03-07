import path from "node:path";

import { z } from "zod";

const ModuleKindSchema = z.enum(["core", "integration", "plugin", "sdk", "cli"]);
const ModulePlatformSchema = z.enum([
  "node",
  "browser",
  "react",
  "react-native",
  "vue",
  "svelte",
  "solid",
  "universal"
]);
const ModuleStabilitySchema = z.enum(["experimental", "beta", "stable", "deprecated"]);

const GithubLinkSchema = z.discriminatedUnion("state", [
  z.object({
    state: z.literal("configured"),
    url: z.string().min(1)
  }),
  z.object({
    state: z.literal("unset")
  })
]);

const ProjectLinksSchema = z.object({
  github: GithubLinkSchema
});

const LinkItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1)
});

const LinksSchema = z.union([
  z.object({ kind: z.literal("none") }),
  z.object({ kind: z.literal("links"), items: z.array(LinkItemSchema) })
]);

const AnnouncementSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1)
});

const UpstreamDocSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1)
});

const ModuleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  npm: z.object({
    name: z.string().min(1),
    distTag: z.string().min(1)
  }),
  folder: z.object({
    packageDir: z.string().min(1),
    docsDir: z.string().min(1)
  }),
  kind: ModuleKindSchema,
  platforms: z.array(ModulePlatformSchema).min(1),
  stability: ModuleStabilitySchema,
  links: LinksSchema,
  announcements: z.array(AnnouncementSchema),
  upstreamDocs: z.array(UpstreamDocSchema)
});

const DocsSchema = z.object({
  orphanMode: z.enum(["warn", "fail", "ignore"]),
  apiDocs: z.enum(["enabled", "disabled"])
});

export const DotSchema = z
  .object({
    schemaVersion: z.literal(1),
    project: z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      links: ProjectLinksSchema
    }),
    publishing: z.object({
      scope: z.string().min(1),
      nodeEngines: z.string().min(1),
      license: z.string().min(1)
    }),
    modules: z.array(ModuleSchema).min(1),
    docs: DocsSchema
  })
  .strict()
  .superRefine((dot, ctx) => {
    const moduleIds = new Set<string>();
    const npmNames = new Set<string>();

    for (const mod of dot.modules) {
      if (moduleIds.has(mod.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duplicate module id: " + mod.id,
          path: ["modules", mod.id]
        });
      }
      moduleIds.add(mod.id);

      if (npmNames.has(mod.npm.name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duplicate npm package name: " + mod.npm.name,
          path: ["modules", mod.id, "npm", "name"]
        });
      }
      npmNames.add(mod.npm.name);

      const expectedPrefix = path.join("apps", dot.project.id + "-site", "content", "docs");
      if (!mod.folder.docsDir.startsWith(expectedPrefix)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "docsDir must be inside " + expectedPrefix,
          path: ["modules", mod.id, "folder", "docsDir"]
        });
      }
    }
  });

export type Dot = z.infer<typeof DotSchema>;
