import { expect, test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * A Japanese table must not scroll sideways where its English counterpart fits.
 * Japanese has no spaces to wrap at, so a ja table is the one that overflows
 * first, and nothing else notices: `keep-all` on table cells made ten of them
 * scroll on a desktop-width page while every en one fitted.
 *
 * Measured in Chromium, the only engine that implements the `auto-phrase` the
 * headers ask for (`src/styles/custom.css`); an engine without it breaks them
 * between any two characters, which only makes them narrower.
 *
 * The Markdown tables of a page and of its translation are compared in document
 * order, so the two must have as many.
 */

const jaDir = path.resolve(import.meta.dirname, '../src/content/docs/ja');

/** Desktop width: the content column is 632px beside the sidebar and the table of contents. */
const desktopViewport = { width: 1280, height: 800 } as const;

const routes: readonly string[] = fs
  .readdirSync(jaDir, { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.mdx?$/u.test(file))
  // Only pages with a Markdown table: a delimiter row (`| --- | :-: |`),
  // indented or not.
  .filter((file) =>
    /^[ \t]*\|?[ \t]*:?-+:?[ \t]*\|/mu.test(
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFileSync(path.resolve(jaDir, file), 'utf8'),
    ),
  )
  .map((file) =>
    file
      .split(path.sep)
      .join('/')
      .replace(/(?:^|\/)index\.mdx?$/u, '')
      .replace(/\.mdx?$/u, ''),
  )
  .toSorted();

test.use({ viewport: desktopViewport });

test('finds the pages with tables', { tag: '@layout' }, () => {
  expect.soft(routes).not.toHaveLength(0);
});

for (const route of routes) {
  test(
    `ja/${route}: no table overflows that fits in en`,
    {
      tag: '@layout',
    },
    async ({ page }) => {
      /**
       * For each Markdown table of the page, in document order, how far it
       * overflows the content column (`"<scrollWidth>px > <clientWidth>px"`), or
       * `undefined` where it fits.
       */
      const tableOverflows = async (
        url: string,
      ): Promise<readonly (string | undefined)[]> => {
        await page.goto(url);

        // Noto Sans JP is self-hosted and loads after the page; a table
        // measured in the fallback font is the wrong width.
        await page.evaluate(async () => {
          await document.fonts.ready;
        });

        // A demo draws its own tables once it hydrates, whenever that is, and
        // styles them itself.
        return page
          .getByRole('main')
          .getByRole('table')
          .evaluateAll((tables) =>
            tables
              .filter((table) => table.closest('astro-island') === null)
              .map((table) =>
                table.scrollWidth > table.clientWidth
                  ? `${table.scrollWidth}px > ${table.clientWidth}px`
                  : undefined,
              ),
          );
      };

      const suffix = route === '' ? '' : `${route}/`;

      const en = await tableOverflows(suffix);

      const ja = await tableOverflows(`ja/${suffix}`);

      expect.soft(ja, 'as many tables in ja as in en').toHaveLength(en.length);

      const jaOnly = ja.flatMap((overflow, index) =>
        overflow !== undefined && en[index] === undefined
          ? [`table ${index + 1}: ${overflow}`]
          : [],
      );

      expect
        .soft(jaOnly, 'ja tables that scroll where en ones fit')
        .toStrictEqual([]);
    },
  );
}
