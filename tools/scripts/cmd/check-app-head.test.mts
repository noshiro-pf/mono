import dedent from 'dedent';
import type { ReadonlyRecord, StrictOmit } from 'ts-type-forge';
import { parseAppHead } from '../lib/app-head.mjs';
import {
  type AppFacts,
  collectAppHeadViolations,
  type PublicFile,
} from './check-app-head.mjs';

const SITE = 'https://example.web.app/';

const publishedHead = (overrides: ReadonlyRecord<string, string> = {}) => {
  const meta: ReadonlyRecord<string, string> = {
    description: 'What it does',
    'theme-color': '#215db0',
    'apple-mobile-web-app-title': 'App',
    'og:type': 'website',
    'og:title': 'App',
    'og:description': 'What it does',
    'og:url': SITE,
    'og:image': `${SITE}og-image.png`,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': 'App',
    'twitter:card': 'summary_large_image',
    ...overrides,
  } as const;

  return dedent`
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        ${Object.entries(meta)
          .filter(([, content]) => content !== '')
          .map(([key, content]) =>
            key.startsWith('og:')
              ? `<meta property="${key}" content="${content}" />`
              : `<meta name="${key}" content="${content}" />`,
          )
          .join('\n')}
      </head>
    </html>
  `;
};

const svg = (content: string): PublicFile =>
  ({
    png: undefined,
    text: content,
  }) as const;

const png = (width: number, height: number): PublicFile =>
  ({
    png: { width, height },
    text: undefined,
  }) as const;

const goodFiles: ReadonlyMap<string, PublicFile> = new Map<string, PublicFile>([
  ['favicon.svg', svg('<svg><!-- a drawing --></svg>')],
  ['apple-touch-icon.png', png(180, 180)],
  ['og-image.png', png(1200, 630)],
]);

const facts = (
  html: string,
  overrides: Partial<StrictOmit<AppFacts, 'head'>> = {},
): AppFacts =>
  ({
    head: parseAppHead(html),
    publicFiles: goodFiles,
    pagesUrl: undefined,
    firebaseUrl: SITE,
    ...overrides,
  }) as const;

describe('collectAppHeadViolations', () => {
  test('passes a published page that has everything', () => {
    assert.deepStrictEqual(
      collectAppHeadViolations(facts(publishedHead())),
      [],
    );
  });

  test('passes an unpublished page with a tab icon alone', () => {
    const html = '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />';

    assert.deepStrictEqual(collectAppHeadViolations(facts(html)), []);
  });

  test('fails a page with no tab icon', () => {
    const violations = collectAppHeadViolations(facts('<title>x</title>'));

    assert.isTrue(violations.some((v) => v.includes('rel="icon"')));
  });

  test('fails an icon that public/ does not have', () => {
    const html = '<link rel="icon" href="/vite.svg" />';

    const violations = collectAppHeadViolations(facts(html));

    assert.isTrue(violations.some((v) => v.includes('public/vite.svg')));
  });

  test('fails an SVG with two hyphens inside a comment', () => {
    const violations = collectAppHeadViolations(
      facts(publishedHead(), {
        publicFiles: new Map<string, PublicFile>([
          ...goodFiles,
          ['favicon.svg', svg('<svg><!-- the --accent colour --></svg>')],
        ]),
      }),
    );

    assert.isTrue(violations.some((v) => v.includes('"--"')));
  });

  test('fails a set of touch icons by size', () => {
    const html = dedent`
      <link rel="icon" href="/favicon.svg" />
      <link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    `;

    const violations = collectAppHeadViolations(facts(html));

    assert.isTrue(violations.some((v) => v.includes('more than one')));
  });

  test('fails a Pages app whose og:url is not its Pages URL', () => {
    const violations = collectAppHeadViolations(
      facts(publishedHead(), {
        pagesUrl: 'https://noshiro-pf.github.io/mono/app/',
      }),
    );

    assert.isTrue(violations.some((v) => v.includes('published to Pages')));
  });

  test('fails a Pages app with no og:url at all', () => {
    const html = '<link rel="icon" href="/favicon.svg" />';

    const violations = collectAppHeadViolations(
      facts(html, { pagesUrl: 'https://noshiro-pf.github.io/mono/app/' }),
    );

    assert.isTrue(violations.some((v) => v.includes('og:url is missing')));
  });

  test("fails an og:url naming another Firebase project's site", () => {
    const violations = collectAppHeadViolations(
      facts(publishedHead(), { firebaseUrl: 'https://other.web.app/' }),
    );

    assert.isTrue(violations.some((v) => v.includes('.firebaserc')));
  });

  test('lets a Firebase app go unpublished', () => {
    const html = '<link rel="icon" href="/favicon.svg" />';

    assert.deepStrictEqual(collectAppHeadViolations(facts(html)), []);
  });

  test('fails a published page missing a tag', () => {
    const violations = collectAppHeadViolations(
      facts(publishedHead({ 'og:image:alt': '' })),
    );

    assert.deepStrictEqual(violations, [
      'is published (it has og:url) but has no <meta> "og:image:alt".',
    ]);
  });

  test('fails a relative og:image', () => {
    const violations = collectAppHeadViolations(
      facts(publishedHead({ 'og:image': 'icons/favicon-96x96.png' })),
    );

    assert.isTrue(violations.some((v) => v.includes('not under og:url')));
  });

  test('fails an og:image of the wrong size', () => {
    const violations = collectAppHeadViolations(
      facts(publishedHead(), {
        publicFiles: new Map<string, PublicFile>([
          ...goodFiles,
          ['og-image.png', png(96, 96)],
        ]),
      }),
    );

    assert.isTrue(violations.some((v) => v.includes('1200×630')));
  });

  test('fails a small card', () => {
    const violations = collectAppHeadViolations(
      facts(publishedHead({ 'twitter:card': 'summary' })),
    );

    assert.isTrue(violations.some((v) => v.includes('summary_large_image')));
  });

  test('fails a touch icon that is not 180×180', () => {
    const violations = collectAppHeadViolations(
      facts(publishedHead(), {
        publicFiles: new Map<string, PublicFile>([
          ...goodFiles,
          ['apple-touch-icon.png', png(57, 57)],
        ]),
      }),
    );

    assert.isTrue(violations.some((v) => v.includes('180×180')));
  });
});
