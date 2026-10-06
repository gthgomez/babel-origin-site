import { defineCollection, z } from "astro:content";
import { docsSchema } from "@astrojs/starlight/schema";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";

const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema({
    extend: z.object({
      // Source provenance metadata rendered by DocsSourceNote.astro.
      pageType: z.enum(["tutorial", "guide", "concept", "reference"]),
      sourceRevision: z.string().regex(/^[0-9a-f]{40}$/, "full 40-char git SHA required"),
      reviewedAt: z.coerce.date(),
      interfaces: z.array(z.string()).default([]),
      prerequisites: z.array(z.string()).default([]),
      sourcePaths: z.array(z.string()).min(1, "at least one Babel source path required"),
    }),
  }),
});

export const collections = { docs, i18n: defineCollection({ loader: i18nLoader() }) };
