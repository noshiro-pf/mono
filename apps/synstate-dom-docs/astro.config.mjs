import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://noshiro-pf.github.io',
  // Served beside the synstate documentation, from this repository's Pages.
  // `tools/scripts/cmd/build-pages-site.mts` copies `dist/` to the same
  // directory, so the two have to agree.
  base: '/mono/synstate-dom/',
  integrations: [
    starlight({
      title: 'synstate-dom',
      description:
        'A compiler-free, fine-grained UI library that binds synstate observables directly to the DOM.',
      customCss: ['./src/styles/custom.css'],
      // synstate's own icon, until synstate-dom has one.
      favicon: '/favicon.ico',
      head: [
        // The stripe Discord draws beside the link card; synstate's blue.
        { tag: 'meta', attrs: { name: 'theme-color', content: '#3b82f6' } },
        // For iOS's "Add to Home Screen", which does not read the favicon and
        // without a touch icon draws the title's first letter instead. The
        // PNG is synstate's, from `apps/synstate-docs/public/favicon/`.
        {
          tag: 'link',
          attrs: {
            rel: 'apple-touch-icon',
            href: '/mono/synstate-dom/apple-touch-icon.png',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'apple-mobile-web-app-title',
            content: 'synstate-dom',
          },
        },
      ],
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        ja: { label: '日本語', lang: 'ja' },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/noshiro-pf/mono/tree/main/libs/synstate-dom',
        },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          translations: { ja: 'はじめに' },
          items: [
            { slug: 'getting-started/introduction' },
            { slug: 'getting-started/installation' },
          ],
        },
        {
          label: 'Guides',
          translations: { ja: 'ガイド' },
          items: [
            { slug: 'guides/bindable' },
            { slug: 'guides/elements' },
            { slug: 'guides/control-flow' },
            { slug: 'guides/components' },
            { slug: 'guides/lifecycle' },
          ],
        },
        {
          label: 'Examples',
          translations: { ja: 'サンプル' },
          items: [{ slug: 'examples/todo-list' }],
        },
        {
          label: 'Background',
          translations: { ja: '背景' },
          items: [
            { slug: 'background/without-a-compiler' },
            { slug: 'background/benchmark' },
          ],
        },
      ],
    }),
  ],
});
