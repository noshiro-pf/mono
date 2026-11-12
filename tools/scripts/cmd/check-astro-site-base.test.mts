import dedent from 'dedent';
import {
  findAstroBaseProblems,
  unlistedAstroConfigs,
} from './check-astro-site-base.mjs';

const config = (
  base: string,
  site = "'https://noshiro-pf.github.io'",
): string =>
  dedent`
    import { defineConfig } from 'astro/config';

    export default defineConfig({
      site: ${site},
      base: ${base},
      integrations: [],
    });
  `;

const problemsOf = (text: string): readonly string[] =>
  findAstroBaseProblems([
    { relativePath: 'apps/x-docs/astro.config.mjs', text, siteDir: 'x' },
  ]);

describe(findAstroBaseProblems, () => {
  test('a config whose base and site match passes', () => {
    expect(problemsOf(config("'/mono/x/'"))).toStrictEqual([]);
  });

  test('double quotes and a trailing comma are read as the same value', () => {
    expect(
      problemsOf(
        dedent`
          export default defineConfig({
            site: "https://noshiro-pf.github.io",
            base: "/mono/x/",
          });
        `,
      ),
    ).toStrictEqual([]);
  });

  test('another base is reported with both values', () => {
    expect(problemsOf(config("'/mono/other/'"))).toStrictEqual([
      "apps/x-docs/astro.config.mjs: `base` is '/mono/other/', and build-pages-site.mts copies the site to '/mono/x/'.",
    ]);
  });

  test.each([
    ['a computed base', config('BASE')],
    [
      'no base',
      dedent`
        export default defineConfig({
          site: 'https://noshiro-pf.github.io',
        });
      `,
    ],
  ])('%s is not a string literal', (_, text) => {
    expect(problemsOf(text)).toStrictEqual([
      "apps/x-docs/astro.config.mjs: `base` is not a string literal on its own line, and build-pages-site.mts copies the site to '/mono/x/'.",
    ]);
  });

  test('another site origin is reported', () => {
    expect(
      problemsOf(config("'/mono/x/'", "'https://example.com'")),
    ).toStrictEqual([
      "apps/x-docs/astro.config.mjs: `site` is 'https://example.com', and the Pages site is served from 'https://noshiro-pf.github.io'.",
    ]);
  });
});

describe(unlistedAstroConfigs, () => {
  test('names an Astro config under apps/ that no site lists', () => {
    expect(
      unlistedAstroConfigs(
        [
          'apps/x-docs/astro.config.mjs',
          'apps/y-docs/astro.config.mts',
          'apps/y-docs/src/index.mts',
          'experimental/z/astro.config.mjs',
        ],
        ['x-docs'],
      ),
    ).toStrictEqual(['apps/y-docs/astro.config.mts']);
  });
});
