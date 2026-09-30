import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    poster: z.string(),
    order: z.number().int(),
  }),
});

const experimentCategory = z.enum(['exper', 'design', 'develop', 'other']);
const experimentDisplay = z.enum(['inline', 'full-page']);

const experimentSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    category: experimentCategory,
    display: experimentDisplay.default('inline'),
    sidebarOrder: z.number().int().optional(),
    thumbnail: z.string().optional(),
    externalUrl: z.string().url().optional(),
    featured: z.boolean().optional(),
    /** When false, hidden from /experiments index, masonry, and detail routes. */
    published: z.boolean().default(false),
    meta: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.display === 'full-page' && !data.thumbnail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'thumbnail is required when display is "full-page"',
        path: ['thumbnail'],
      });
    }
    if (data.featured && data.sidebarOrder === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'sidebarOrder is recommended when featured is true',
        path: ['sidebarOrder'],
      });
    }
  });

const experiments = defineCollection({
  loader: glob({
    base: './src/content/experiments',
    pattern: '**/*.{md,mdx}',
    ignore: ['TEMPLATE.md'],
  }),
  schema: experimentSchema,
});

export const collections = { projects, experiments };
