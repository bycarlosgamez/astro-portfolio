// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://bycarlosgamez.com',
  redirects: {
    '/case-studies/design-system': '/projects',
    '/case-studies/form-redesign': '/projects',
    '/projects/design-system': '/projects',
    '/projects/form-redesign': '/projects',
  },
});
