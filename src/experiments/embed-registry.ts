export const embedModules = import.meta.glob('/src/experiments/embed/*.astro');

export function embedPathForSlug(slug: string) {
  return `/src/experiments/embed/${slug}.astro`;
}

export function hasEmbed(slug: string) {
  return embedPathForSlug(slug) in embedModules;
}
