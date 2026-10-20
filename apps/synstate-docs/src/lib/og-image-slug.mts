/**
 * The `[...slug]` of a page's OG image, shared by `src/pages/og/[...slug].png.ts`
 * and `src/components/Head.astro` so the two cannot disagree. Starlight gives
 * the root page the entry id `''`, which would make the URL `og/.png` while
 * Astro writes the image to `og/index.png`.
 * e.g. `'ja/guides/why-synstate'` → `og/ja/guides/why-synstate.png`,
 * `''` → `og/index.png`, `'ja'` → `og/ja.png`.
 */
export const toOgImageSlug = (entryId: string): string =>
  entryId === '' ? 'index' : entryId;
