import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

export type DemoModule = {
  default: AstroComponentFactory;
};

export const demoModules = import.meta.glob<DemoModule>('/src/experiments/demos/*.astro');

export function demoPathForSlug(slug: string) {
  return `/src/experiments/demos/${slug}.astro`;
}

export function hasDemo(slug: string) {
  return demoPathForSlug(slug) in demoModules;
}
