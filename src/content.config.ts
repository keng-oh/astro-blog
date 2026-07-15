import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    aliases: z.array(z.string()).default([]),
    created: z.coerce.date(),
    updated: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    status: z.literal('active'),
  }),
});

export const collections = { blog };
