// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://bycarlosgamez.com',
  redirects: {
    '/case-studies/design-system': '/projects/design-system',
    '/case-studies/form-redesign': '/projects/form-redesign',
  },
});
