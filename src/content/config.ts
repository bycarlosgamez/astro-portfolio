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
const experimentKind = z.enum(['card', 'demo']);
const experimentPreview = z.enum(['live', 'poster', 'none']);

const experimentSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    category: experimentCategory,
    kind: experimentKind.default('card'),
    preview: experimentPreview.default('none'),
    sidebarOrder: z.number().int().optional(),
    thumbnail: z.string().optional(),
    externalUrl: z.string().url().optional(),
    demoEmbedUrl: z.string().url().optional(),
    featured: z.boolean().optional(),
    /** When false, hidden from /experiments index and sidebar; embed URL still works for WIP. */
    published: z.boolean().default(false),
    meta: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.kind === 'demo' && !data.demoEmbedUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'demoEmbedUrl is required when kind is "demo"',
        path: ['demoEmbedUrl'],
      });
    }
    if (data.preview === 'poster' && !data.thumbnail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'thumbnail is required when preview is "poster"',
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
