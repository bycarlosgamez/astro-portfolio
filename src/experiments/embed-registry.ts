import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

export type EmbedModule = {
  default: AstroComponentFactory;
};

export const embedModules = import.meta.glob<EmbedModule>('/src/experiments/embed/*.astro');

export function embedPathForSlug(slug: string) {
  return `/src/experiments/embed/${slug}.astro`;
}

export function hasEmbed(slug: string) {
  return embedPathForSlug(slug) in embedModules;
}
