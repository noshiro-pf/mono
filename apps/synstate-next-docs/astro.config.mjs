import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
// A moved file or a renamed export still fails when this config loads.
// @ts-expect-error TS5097, the `.mts` extension, which Node.js needs here
import { groupTitles, referencePages } from './scripts/reference-pages.mts';

export default defineConfig({
  site: 'https://noshiro-pf.github.io',
  // Served beside the synstate documentation, from this repository's Pages.
  // `tools/scripts/cmd/build-pages-site.mts` copies `dist/` to the same
  // directory (`check:root:astro-site-base`).
  base: '/mono/synstate-next/',
  integrations: [
    starlight({
      title: 'synstate-next',
      description:
        'A glitch-free state management library for TypeScript, with built-in async operators, such as debounce and switchMap, that stay glitch-free.',
      customCss: ['./src/styles/custom.css'],
      // synstate's own icon, until synstate-next has one.
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
            href: '/mono/synstate-next/apple-touch-icon.png',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'apple-mobile-web-app-title',
            content: 'synstate-next',
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
          href: 'https://github.com/noshiro-pf/mono/tree/main/libs/synstate-next',
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
            { slug: 'guides/why-synstate-next' },
            { slug: 'guides/declarative-state' },
            { slug: 'guides/state-and-writes' },
            { slug: 'guides/deriving-values' },
            { slug: 'guides/async-operators' },
            { slug: 'guides/owners-and-lifetime' },
            { slug: 'guides/custom-operators-and-sources' },
            { slug: 'guides/using-with-a-ui' },
          ],
        },
        {
          label: 'Examples',
          translations: { ja: 'サンプル' },
          items: [{ slug: 'examples/patterns' }],
        },
        {
          label: 'Comparison',
          translations: { ja: '比較' },
          items: [
            { slug: 'comparison/libraries' },
            { slug: 'comparison/async-logic' },
            { slug: 'comparison/operators-on-signals' },
            { slug: 'comparison/benchmark' },
          ],
        },
        {
          label: 'Internals',
          translations: { ja: '内部の仕組み' },
          items: [
            { slug: 'internals/how-an-update-propagates' },
            { slug: 'internals/why-no-completion' },
            { slug: 'internals/tracing-an-update' },
            { slug: 'internals/prior-art-and-design-rationale' },
          ],
        },
        {
          label: 'Background',
          translations: { ja: '背景' },
          items: [{ slug: 'background/changes-from-synstate' }],
        },
        {
          label: 'Reference',
          translations: { ja: 'リファレンス' },
          items: [
            { slug: 'reference' },
            ...Object.entries(groupTitles.en).map(([group, label]) => ({
              label,
              translations: {
                // `Object.entries` widens the key to `string`; it is one of
                // `groupTitles.en`'s, which `groupTitles.ja` shares.
                ja: groupTitles.ja[
                  /** @type {keyof typeof groupTitles.ja} */ (group)
                ],
              },
              collapsed: true,
              items: referencePages
                .filter((p) => p.group === group)
                .map((p) => ({ slug: `reference/${group}/${p.slug}` })),
            })),
          ],
        },
      ],
    }),
  ],
});
