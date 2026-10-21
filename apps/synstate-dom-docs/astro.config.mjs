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
