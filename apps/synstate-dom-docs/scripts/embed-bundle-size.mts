import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';
import { formatFiles, isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { embedInto, type Embedded } from './embed-markers.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Embeds `apps/synstate-dom-benchmark/BUNDLE-SIZE.md` into the bundle size
 * pages, as `embed-benchmark.mts` embeds RESULTS.md: every figure on them sits
 * between a pair of `<!-- bundle-size:<key> -->` markers.
 *
 * BUNDLE-SIZE.md is written by that app's `pnpm run bundle-size`. Its tables
 * are parsed rather than copied, so that the Japanese page can name the
 * applications in Japanese; an application this script has no name for is an
 * error.
 */
export const embedBundleSize = async (): Promise<Result<undefined, string>> => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const markdown = await fs.readFile(bundleSizePath, 'utf8');

    const parsed = parseBundleSize(markdown);

    if (Result.isErr(parsed)) {
      return Result.err(`❌ ${bundleSizePath}: ${parsed.value}`);
    }

    for (const [locale, pagePath] of pages) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const page = await fs.readFile(pagePath, 'utf8');

      const embedded = embedInto(
        page,
        'bundle-size',
        render(parsed.value, locale),
      );

      if (Result.isErr(embedded)) {
        return Result.err(`❌ ${pagePath}: ${embedded.value}`);
      }

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(pagePath, embedded.value, 'utf8');

      await formatFiles([pagePath]);

      console.info(
        `✓ Embedded BUNDLE-SIZE.md into ${path.relative(workspaceRootPath, pagePath)}`,
      );
    }

    return Result.ok(undefined);
  } catch (error) {
    return Result.err(`❌ ${unknownToString(error)}`);
  }
};

type Locale = 'en' | 'ja';

const bundleSizePath = path.resolve(
  workspaceRootPath,
  '../synstate-dom-benchmark/BUNDLE-SIZE.md',
);

const pages: readonly (readonly [Locale, string])[] = [
  [
    'en',
    path.resolve(
      workspaceRootPath,
      'src/content/docs/background/bundle-size.md',
    ),
  ],
  [
    'ja',
    path.resolve(
      workspaceRootPath,
      'src/content/docs/ja/background/bundle-size.md',
    ),
  ],
] as const;

type BundleSize = Readonly<{
  viteVersion: string;
  /** `<package> <version>`, as BUNDLE-SIZE.md lists them. */
  versions: readonly string[];
  gzip: Table;
  brotli: Table;
}>;

/** One of BUNDLE-SIZE.md's tables, in kB. */
type Table = Readonly<{
  libraries: readonly string[];
  rows: readonly Readonly<{
    application: string;
    sizes: readonly number[];
  }>[];
}>;

/** The section of BUNDLE-SIZE.md each table embedded is read from. */
const sections = {
  gzip: '## Minified and gzipped',
  brotli: '## Minified and Brotli-compressed',
} as const;

const applicationNamesJa: ReadonlyRecord<string, string> = {
  'everything exported': 'すべての export',
  counter: 'カウンター',
  'js-framework-benchmark table': 'js-framework-benchmark の表',
  'loan scenario': 'ローンのシナリオ',
  'schedule scenario': '工程表のシナリオ',
  'zoom scenario': 'ズームのシナリオ',
} as const;

const cells = (line: string): readonly string[] =>
  line
    .replace(/^\|/u, '')
    .replace(/\|$/u, '')
    .split('|')
    .map((cell) => cell.trim());

/** Reads the first table after the line `heading`. */
const parseTable = (
  lines: readonly string[],
  heading: string,
): Result<Table, string> => {
  const from = lines.indexOf(heading);

  if (from === -1) {
    return Result.err(`the "${heading}" section was not found`);
  }

  const tableStart = lines.findIndex(
    (line, i) => i > from && line.startsWith('|'),
  );

  const tableEnd = lines.findIndex(
    (line, i) => i > tableStart && !line.startsWith('|'),
  );

  const tableLines =
    tableStart === -1
      ? ([] as const)
      : lines.slice(tableStart, tableEnd === -1 ? undefined : tableEnd);

  const [header, _separator, ...body] = tableLines;

  if (header === undefined || !Arr.isNonEmpty(body)) {
    return Result.err(`no table was found under "${heading}"`);
  }

  const libraries = Arr.tail(cells(header));

  const mut_rows: Table['rows'][number][] = [];

  for (const line of body) {
    const [application, ...values] = cells(line);

    const sizes = values.map((value) =>
      Result.unwrapOkOr(Num.safeParseFloat(value), Number.NaN),
    );

    if (
      application === undefined ||
      sizes.length !== libraries.length ||
      sizes.some((s) => !(Number.isFinite(s) && s > 0))
    ) {
      return Result.err(`a row could not be read: ${line}`);
    }

    mut_rows.push({ application, sizes });
  }

  return Result.ok({ libraries, rows: mut_rows });
};

const parseBundleSize = (markdown: string): Result<BundleSize, string> => {
  const environment =
    /bundled by Vite (?<viteVersion>\S+) .*Versions: (?<versions>.+?)\. /u.exec(
      markdown,
    );

  const viteVersion = environment?.groups?.['viteVersion'];

  const versions = environment?.groups?.['versions'];

  if (viteVersion === undefined || versions === undefined) {
    return Result.err(
      'the "bundled by Vite …. Versions: …." sentence was not found; update parseBundleSize to its new wording',
    );
  }

  const lines = markdown.split('\n').map((line) => line.trim());

  const gzip = parseTable(lines, sections.gzip);

  if (Result.isErr(gzip)) {
    return gzip;
  }

  const brotli = parseTable(lines, sections.brotli);

  if (Result.isErr(brotli)) {
    return brotli;
  }

  return Result.ok({
    viteVersion,
    versions: versions.split(', ').map((v) => v.replaceAll('`', '')),
    gzip: gzip.value,
    brotli: brotli.value,
  });
};

/** What each marker on a page is replaced with. */
const render = (
  bundleSize: BundleSize,
  locale: Locale,
): ReadonlyRecord<string, Embedded> => {
  const applicationName = (application: string): string => {
    if (locale === 'en') {
      return application;
    }

    const name = applicationNamesJa[application];

    if (name === undefined) {
      throw new Error(
        `no Japanese name for the application "${application}"; add it to applicationNamesJa`,
      );
    }

    return name;
  };

  const table = ({ libraries, rows }: Table): string =>
    [
      `| ${locale === 'en' ? 'application (kB)' : 'アプリケーション（kB）'} | ${libraries.join(' | ')} |`,
      `| :-- | ${libraries.map(() => '--:').join(' | ')} |`,
      ...rows.map(
        ({ application, sizes }) =>
          `| ${applicationName(application)} | ${sizes.map((s) => s.toFixed(1)).join(' | ')} |`,
      ),
    ].join('\n');

  const versions = bundleSize.versions.map((v) => `\`${v}\``).join(', ');

  const environment =
    locale === 'en'
      ? (`Bundled by Vite ${bundleSize.viteVersion}. Versions: ${versions}.` as const)
      : (`Vite ${bundleSize.viteVersion} でバンドルしました。バージョンは ${versions} です。` as const);

  return {
    environment: { text: environment, block: true },
    gzip: { text: table(bundleSize.gzip), block: true },
    brotli: { text: table(bundleSize.brotli), block: true },
  };
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedBundleSize();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
