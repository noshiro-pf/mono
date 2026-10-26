// cspell:ignore apos
/**
 * What a browser app's `index.html` says about itself in `<head>`: the tab
 * and home-screen icons and the link card. Read by `check-app-head.mts`, which
 * asks it of every app, and by `gen-app-images.mts`, which draws the images
 * it names. `docs/browser-app-head.md` says what belongs there and why.
 */

import { Arr, Num, Result } from 'ts-data-forge';

/**
 * `<head>` of one page, read with a pattern rather than an HTML parser: the
 * files are ours, Prettier writes every tag the same way, and the only thing
 * read is `<meta>`, `<link>`, `<title>` and the `lang` of `<html>`.
 */
export const parseAppHead = (html: string): AppHead => {
  const tags = Array.from(html.matchAll(VOID_TAG), (matched) => ({
    name: matched.groups?.['name'] ?? '',
    attributes: parseAttributes(matched.groups?.['attributes'] ?? ''),
  }));

  return {
    lang: parseAttributes(
      HTML_TAG.exec(html)?.groups?.['attributes'] ?? '',
    ).get('lang'),
    title: TITLE_TAG.exec(html)?.groups?.['title']?.trim(),
    meta: new Map(
      Arr.generate(function* () {
        // Reversed so that, read into a map, the first of a repeated name wins
        // — as a crawler reads it.
        for (const { name, attributes } of tags.toReversed()) {
          const key = attributes.get('name') ?? attributes.get('property');

          const content = attributes.get('content');

          if (name === 'meta' && key !== undefined && content !== undefined) {
            yield [key, content] as const;
          }
        }
      }),
    ),
    links: Arr.generate(function* () {
      for (const { name, attributes } of tags) {
        const rel = attributes.get('rel');

        const href = attributes.get('href');

        if (name === 'link' && rel !== undefined && href !== undefined) {
          yield { rel, href } as const;
        }
      }
    }),
  };
};

/** The `href` of every `<link>` whose `rel` is `rel`, in document order. */
export const linkTargets = (head: AppHead, rel: string): readonly string[] =>
  head.links.filter((link) => link.rel === rel).map((link) => link.href);

/**
 * The path under `public/` that an `href` in `index.html` names: Vite serves
 * `public/` at the base, and prefixes a root-relative `href` with it.
 * `undefined` for a URL that is not the page's own file.
 */
export const publicPathOf = (href: string): string | undefined =>
  /^[a-z][a-z0-9+.-]*:/iu.test(href) || href.startsWith('//')
    ? undefined
    : href.replace(/^\.?\//u, '');

export type AppHead = Readonly<{
  lang: string | undefined;
  title: string | undefined;
  /**
   * `<meta>` contents keyed by `name` or `property` (`description`,
   * `og:image`, `twitter:card`, ...). The first of a repeated key wins.
   */
  meta: ReadonlyMap<string, string>;
  links: readonly Readonly<{ rel: string; href: string }>[];
}>;

const VOID_TAG = /<(?<name>meta|link)\b(?<attributes>[^>]*)>/gu;

const HTML_TAG = /<html\b(?<attributes>[^>]*)>/u;

const TITLE_TAG = /<title>(?<title>[^<]*)<\/title>/u;

const ATTRIBUTE = /(?<key>[a-z][a-z:-]*)="(?<value>[^"]*)"/gu;

const parseAttributes = (source: string): ReadonlyMap<string, string> =>
  new Map(
    Array.from(
      source.matchAll(ATTRIBUTE),
      (matched) =>
        [
          matched.groups?.['key'] ?? '',
          decodeEntities(matched.groups?.['value'] ?? ''),
        ] as const,
    ),
  );

/** The character references an attribute value can carry, `&amp;` last. */
const decodeEntities = (value: string): string =>
  value
    .replaceAll(/&#x(?<hex>[\da-f]+);/giu, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replaceAll(/&#(?<decimal>\d+);/gu, (_, decimal: string) =>
      String.fromCodePoint(
        Result.unwrapOkOr(Num.safeParseInt(decimal), Number.NaN),
      ),
    )
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
