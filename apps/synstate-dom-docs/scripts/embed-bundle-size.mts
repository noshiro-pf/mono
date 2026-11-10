import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';
import { formatFiles, isDirectlyExecuted } from 'ts-repo-utils';
import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
// eslint-disable-next-line import-x/no-relative-packages -- tools/ is not a package; this is how apps reach its shared scripts
import * as markers from '../../../tools/scripts/lib/embed-markers.mjs';
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

    const checked = checkReadingTheResults(parsed.value);

    if (Result.isErr(checked)) {
      return Result.err(`❌ ${bundleSizePath}: ${checked.value}`);
    }

    // Every page is read and checked before any is written, so that a failure
    // leaves no page half-updated.
    const mut_embedded: FixedLengthTuple<2, string>[] = [];

    for (const [locale, pagePath] of pages) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const page = await fs.readFile(pagePath, 'utf8');

      const absent = missingClaims(page, locale);

      if (Arr.isNonEmpty(absent)) {
        return Result.err(
          `❌ ${pagePath}: these sentences under "${readingTheResultsHeadings[locale]}" were reworded or removed; update checkReadingTheResults to match:\n${absent.map((text) => `  - ${text}`).join('\n')}`,
        );
      }

      const embedded = markers.embedInto(
        page,
        'bundle-size',
        render(parsed.value, locale),
      );

      if (Result.isErr(embedded)) {
        return Result.err(`❌ ${pagePath}: ${embedded.value}`);
      }

      mut_embedded.push([pagePath, embedded.value]);
    }

    for (const [pagePath, embedded] of mut_embedded) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(pagePath, embedded, 'utf8');

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

/**
 * A sentence of the "Reading the results" bullets that the tables can break, as
 * it reads on each page, and whether one table bears it out.
 */
type Claim = Readonly<{
  en: string;
  ja: string;
  holds: (table: ClaimTable) => boolean;
}>;

type ClaimTable = Readonly<{
  /**
   * In tenths of a kB, the precision of the tables, so that a bound such as "3
   * times" or "4 kB" compares integers rather than binary fractions.
   */
  size: (application: string, library: ClaimedLibrary) => number;
  /** Every row. */
  allApplications: readonly string[];
  /** The rows below the counter, as the tables lay them out. */
  applications: readonly string[];
}>;

/** The libraries the sentences compare. */
const claimedLibraries = [
  'synstate-dom',
  'Solid',
  'Preact + Signals',
  'Preact',
  'React',
  'VanJS',
] as const;

type ClaimedLibrary = (typeof claimedLibraries)[number];

/** The rows the sentences name. */
const claimedApplications = [
  'everything exported',
  'counter',
  'js-framework-benchmark table',
] as const;

/**
 * Every library larger than another in the counter row is so in `application`'s
 * row, except a pair both in `swappable`, whose order is not claimed. Two other
 * libraries tied in the counter row have no order to keep, so such a tie fails
 * the claim.
 */
const keepsCounterOrder = (
  table: ClaimTable,
  application: string,
  swappable: readonly ClaimedLibrary[],
): boolean =>
  claimedLibraries.every((a) =>
    claimedLibraries.every(
      (b) =>
        a === b ||
        (swappable.includes(a) && swappable.includes(b)) ||
        table.size('counter', a) < table.size('counter', b) ||
        (table.size('counter', a) > table.size('counter', b) &&
          table.size(application, a) > table.size(application, b)),
    ),
  );

const isLargestAfterReact = (
  table: ClaimTable,
  application: string,
  libraries: readonly ClaimedLibrary[],
): boolean =>
  libraries.every(
    (library) =>
      table.size(application, 'React') > table.size(application, library) &&
      claimedLibraries
        .filter((other) => other !== 'React' && !libraries.includes(other))
        .every(
          (other) =>
            table.size(application, library) > table.size(application, other),
        ),
  );

/**
 * The two libraries next in size after React, close enough that the sentences
 * claim no order between them.
 */
const closePair = ['synstate-dom', 'Preact + Signals'] as const;

/**
 * What the "Reading the results" bullets say about the tables. Each sentence
 * has to appear on its page word for word, so rewording one without updating
 * its case here fails too. A new sentence about an order or a margin gets a
 * case here.
 */
const claims: readonly Claim[] = [
  {
    en: 'every row below the counter stays within a few kB of it for every library',
    ja: 'どのライブラリでも、カウンターより下の行はどれもカウンターから数 kB 以内に収まります',
    // "a few": 4 kB
    holds: (table) =>
      table.applications.every((application) =>
        claimedLibraries.every(
          (library) =>
            Math.abs(
              table.size(application, library) - table.size('counter', library),
            ) <= 40,
        ),
      ),
  },
  {
    en: "The rows below it keep the counter row's order of the libraries, except that synstate-dom and Preact + Signals, within about a kB of each other from the counter row down, may change places.",
    ja: 'その下の行もカウンターの行のライブラリの順位を保ちます。ただし、カウンターの行から下で互いに 1 kB ほどの差しかない synstate-dom と Preact + Signals は入れ替わることがあります。',
    // "about a kB": at most 1.5 kB
    holds: (table) =>
      table.applications.every((application) =>
        keepsCounterOrder(table, application, closePair),
      ) &&
      Arr.toUnshifted('counter')(table.applications).every(
        (application) =>
          Math.abs(
            table.size(application, closePair[0]) -
              table.size(application, closePair[1]),
          ) <= 15,
      ),
  },
  {
    en: '**React** is mostly react-dom, whatever the application. Its reconciler and scheduler do not split by what a component uses, so the rows differ by only about a kB.',
    ja: '**React** は、アプリケーションが何であってもほとんどが react-dom です。reconciler と scheduler はコンポーネントが何を使うかによって分かれないので、行どうしの差は 1 kB ほどしかありません。',
    // "about a kB": at most 1.5 kB
    holds: (table) => {
      const sizes = table.allApplications.map((application) =>
        table.size(application, 'React'),
      );

      return Math.max(...sizes) - Math.min(...sizes) <= 15;
    },
  },
  {
    en: '**VanJS** is one small module with nothing to shake off, so even the counter includes all of it.',
    ja: '**VanJS** は tree-shaking する余地のない小さな 1 モジュールなので、カウンターの時点でその全体が入ります。',
    holds: (table) =>
      table.size('counter', 'VanJS') >=
      table.size('everything exported', 'VanJS'),
  },
  {
    en: '**Solid** compiles JSX into templates and calls into a small runtime, so a counter uses only a little of `solid-js/web`. Everything it exports is several times that.',
    ja: '**Solid** は JSX をテンプレートにコンパイルして小さなランタイムを呼び出すので、カウンターでは `solid-js/web` のごく一部しか使いません。すべての export はその数倍あります。',
    // "several times": at least 3 times (Solid)
    holds: (table) =>
      table.size('everything exported', 'Solid') >=
      3 * table.size('counter', 'Solid'),
  },
  {
    en: 'The Preact table is larger than everything exported',
    ja: 'Preact の表がすべての export より大きい',
    holds: (table) =>
      table.size('js-framework-benchmark table', 'Preact') >
      table.size('everything exported', 'Preact'),
  },
  {
    en: 'synstate-dom and Preact + Signals are the largest after React in every row but everything exported.',
    ja: 'すべての export 以外のどの行でも、React の次に大きいのは synstate-dom と Preact + Signals です。',
    holds: (table) =>
      table.allApplications
        .filter((application) => application !== 'everything exported')
        .every((application) =>
          isLargestAfterReact(table, application, closePair),
        ),
  },
  {
    en: '**Everything exported**: synstate-dom and Solid are the largest after React in this row.',
    ja: '**すべての export** の行では、React の次に synstate-dom と Solid が大きくなっています。',
    holds: (table) =>
      isLargestAfterReact(table, 'everything exported', [
        'synstate-dom',
        'Solid',
      ]),
  },
] as const;

/** The claims one table does not bear out, by their English text. */
const unsupportedClaims = ({
  libraries,
  rows,
}: Table): Result<readonly string[], string> => {
  const missing = [
    ...claimedLibraries.filter((library) => !libraries.includes(library)),
    ...claimedApplications.filter((application) =>
      rows.every((row) => row.application !== application),
    ),
  ] as const;

  if (Arr.isNonEmpty(missing)) {
    return Result.err(
      `the "Reading the results" sentences name ${missing.map((name) => `"${name}"`).join(', ')}, which the table lacks; update checkReadingTheResults`,
    );
  }

  // The sentences rank every library, so a column they do not know of would go
  // unchecked.
  const unclaimed = libraries.filter((library) =>
    claimedLibraries.every((claimed) => claimed !== library),
  );

  if (Arr.isNonEmpty(unclaimed)) {
    return Result.err(
      `the "Reading the results" sentences do not know of ${unclaimed.map((name) => `"${name}"`).join(', ')}; add it to claimedLibraries and reword the sentences that rank the libraries`,
    );
  }

  const size = (application: string, library: ClaimedLibrary): number =>
    Math.round(
      (rows.find((row) => row.application === application)?.sizes[
        libraries.indexOf(library)
      ] ?? Number.NaN) * 10,
    );

  const table: ClaimTable = {
    size,
    allApplications: rows.map((row) => row.application),
    applications: rows
      .slice(rows.findIndex((row) => row.application === 'counter') + 1)
      .map((row) => row.application),
  } as const;

  return Result.ok(
    claims.filter((claim) => !claim.holds(table)).map((claim) => claim.en),
  );
};

/**
 * Checks the "Reading the results" bullets against the tables. Those sentences
 * are prose rather than markers, so a run that changes the tables could
 * otherwise leave the pages contradicting them; here such a run fails, naming
 * each sentence the tables no longer bear out.
 */
const checkReadingTheResults = (
  bundleSize: BundleSize,
): Result<undefined, string> => {
  const mut_failures: string[] = [];

  for (const [name, table] of [
    ['gzip', bundleSize.gzip],
    ['Brotli', bundleSize.brotli],
  ] as const) {
    const result = unsupportedClaims(table);

    if (Result.isErr(result)) {
      return Result.err(`the ${name} table: ${result.value}`);
    }

    for (const sentence of result.value) {
      mut_failures.push(`"${sentence}" (${name})`);
    }
  }

  return Arr.isNonEmpty(mut_failures)
    ? Result.err(
        Arr.toUnshifted(
          'the tables no longer bear out these sentences under "Reading the results"; reword them on both pages and update checkReadingTheResults:',
        )(mut_failures.map((failure) => `  - ${failure}`)).join('\n'),
      )
    : Result.ok(undefined);
};

const readingTheResultsHeadings = {
  en: '## Reading the results',
  ja: '## 結果の読み方',
} as const satisfies ReadonlyRecord<Locale, string>;

/** The claims' sentences that `page`'s "Reading the results" section lacks. */
const missingClaims = (page: string, locale: Locale): readonly string[] => {
  const lines = page.split('\n');

  const from = lines.indexOf(readingTheResultsHeadings[locale]);

  const to = lines.findIndex((line, i) => i > from && line.startsWith('## '));

  const section =
    from === -1
      ? ''
      : lines.slice(from + 1, to === -1 ? undefined : to).join('\n');

  return claims
    .map((claim) => claim[locale])
    .filter((text) => !section.includes(text));
};

/** What each marker on a page is replaced with. */
const render = (
  bundleSize: BundleSize,
  locale: Locale,
): ReadonlyRecord<string, markers.Embedded> => {
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
