import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';
import { formatFiles, isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Embeds `apps/synstate-dom-benchmark/RESULTS.md` into the benchmark pages.
 *
 * RESULTS.md is written by that app's `pnpm run benchmark`, by hand, and is
 * the only record of a run. The pages carry no number of their own: every
 * figure on them sits between a pair of `<!-- benchmark:<key> -->` markers and
 * is rewritten from RESULTS.md here, so that a re-run reaches the site by
 * `pnpm run gen` rather than by someone remembering which sentence quoted it.
 *
 * The table is parsed rather than copied, so that the Japanese page can name
 * the operations in Japanese. An operation this script has no name for is an
 * error, not a row left in English.
 */
export const embedBenchmark = async (): Promise<Result<undefined, string>> => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const resultsMd = await fs.readFile(resultsPath, 'utf8');

    const parsed = parseResults(resultsMd);

    if (Result.isErr(parsed)) {
      return Result.err(`❌ ${resultsPath}: ${parsed.value}`);
    }

    for (const [locale, pagePath] of pages) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const page = await fs.readFile(pagePath, 'utf8');

      const embedded = embedInto(page, render(parsed.value, locale));

      if (Result.isErr(embedded)) {
        return Result.err(`❌ ${pagePath}: ${embedded.value}`);
      }

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(pagePath, embedded.value, 'utf8');

      await formatFiles([pagePath]);

      console.info(
        `✓ Embedded RESULTS.md into ${path.relative(workspaceRootPath, pagePath)}`,
      );
    }

    return Result.ok(undefined);
  } catch (error) {
    return Result.err(`❌ ${unknownToString(error)}`);
  }
};

type Locale = 'en' | 'ja';

const resultsPath = path.resolve(
  workspaceRootPath,
  '../synstate-dom-benchmark/RESULTS.md',
);

const pages: readonly (readonly [Locale, string])[] = [
  [
    'en',
    path.resolve(workspaceRootPath, 'src/content/docs/background/benchmark.md'),
  ],
  [
    'ja',
    path.resolve(
      workspaceRootPath,
      'src/content/docs/ja/background/benchmark.md',
    ),
  ],
] as const;

type Results = Readonly<{
  userAgent: string;
  runs: number;
  libraries: readonly string[];
  rows: readonly Readonly<{
    operation: string;
    medians: readonly number[];
  }>[];
}>;

/**
 * The library every ratio on the page is measured against, as RESULTS.md's own
 * second table does.
 */
const subject = 'synstate-dom';

/** The library the page's summary sentence compares {@link subject} with. */
const reference = 'Solid';

const operationNamesJa: ReadonlyRecord<string, string> = {
  'create 1,000 rows': '1,000 行を作る',
  'replace all 1,000 rows': '1,000 行をすべて置き換える',
  'update every 10th of 1,000 rows': '1,000 行の 10 行ごとに更新する',
  'select a row': '行を選択する',
  'swap two rows': '2 行を入れ替える',
  'remove a row': '1 行を削除する',
  'create 10,000 rows': '10,000 行を作る',
  'append 1,000 to 1,000 rows': '1,000 行に 1,000 行を追加する',
  'clear 1,000 rows': '1,000 行を消す',
} as const;

const parseResults = (markdown: string): Result<Results, string> => {
  const environment =
    /Measured in `(?<userAgent>[^`]+)`\. Each figure is the median of (?<runs>\d+) runs of `pnpm run benchmark`/u.exec(
      markdown,
    );

  const userAgent = environment?.groups?.['userAgent'];

  const runs = environment?.groups?.['runs'];

  if (userAgent === undefined || runs === undefined) {
    return Result.err(
      'the "Measured in …. Each figure is the median of N runs" sentence was not found; update parseResults to its new wording',
    );
  }

  // The first table only: the medians. RESULTS.md's ratio table after it is
  // recomputed below, so that the Japanese page can head it in Japanese.
  const lines = markdown.split('\n').map((line) => line.trim());

  const tableStart = lines.findIndex((line) => line.startsWith('|'));

  const tableEnd = lines.findIndex(
    (line, i) => i > tableStart && !line.startsWith('|'),
  );

  const tableLines =
    tableStart === -1
      ? ([] as const)
      : lines.slice(tableStart, tableEnd === -1 ? undefined : tableEnd);

  const [header, _separator, ...body] = tableLines;

  if (header === undefined || !Arr.isNonEmpty(body)) {
    return Result.err('no result table was found');
  }

  const libraries = Arr.tail(cells(header));

  if (!libraries.includes(subject) || !libraries.includes(reference)) {
    return Result.err(
      `the table has no "${subject}" or no "${reference}" column`,
    );
  }

  const mut_rows: Results['rows'][number][] = [];

  for (const line of body) {
    const [operation, ...values] = cells(line);

    const medians = values.map(Number);

    if (
      operation === undefined ||
      medians.length !== libraries.length ||
      medians.some((m) => !(Number.isFinite(m) && m > 0))
    ) {
      return Result.err(`a row could not be read: ${line}`);
    }

    mut_rows.push({ operation, medians });
  }

  return Result.ok({
    userAgent,
    runs: Result.unwrapOkOr(Num.safeParseFloat(runs), Number.NaN),
    libraries,
    rows: mut_rows,
  });
};

const cells = (line: string): readonly string[] =>
  line
    .replace(/^\|/u, '')
    .replace(/\|$/u, '')
    .split('|')
    .map((cell) => cell.trim());

/**
 * What a marker is replaced with. A block (a table, a paragraph) goes on lines
 * of its own so that Markdown still reads it as one; an inline figure stays
 * inside its sentence.
 */
type Embedded = Readonly<{ text: string; block: boolean }>;

/** What each marker on a page is replaced with. */
const render = (
  results: Results,
  locale: Locale,
): ReadonlyRecord<string, Embedded> => {
  const subjectIndex = results.libraries.indexOf(subject);

  const referenceIndex = results.libraries.indexOf(reference);

  const operationName = (operation: string): string => {
    if (locale === 'en') {
      return operation;
    }

    const name = operationNamesJa[operation];

    if (name === undefined) {
      throw new Error(
        `no Japanese name for the operation "${operation}"; add it to operationNamesJa`,
      );
    }

    return name;
  };

  const tableHeader = (firstColumn: string): string =>
    [
      `| ${firstColumn} | ${results.libraries.join(' | ')} |`,
      `| :-- | ${results.libraries.map(() => '--:').join(' | ')} |`,
    ].join('\n');

  const medians = Arr.toUnshifted(
    tableHeader(
      locale === 'en' ? 'operation (median ms)' : '操作（中央値 ms）',
    ),
  )(
    results.rows.map(
      ({ operation, medians: ms }) =>
        `| ${operationName(operation)} | ${ms.map((m) => m.toFixed(2)).join(' | ')} |`,
    ),
  ).join('\n');

  const others = results.libraries.filter((library) => library !== subject);

  const ratios = Arr.toUnshifted(
    [
      `| ${locale === 'en' ? 'operation' : '操作'} | ${others.join(' | ')} |`,
      `| :-- | ${others.map(() => '--:').join(' | ')} |`,
    ].join('\n'),
  )(
    results.rows.map(({ operation, medians: ms }) => {
      const subjectMs = ms[subjectIndex] ?? Number.NaN;

      const cellsOfOthers = ms
        .filter((_, i) => i !== subjectIndex)
        .map((m) => ratio(m, subjectMs));

      return `| ${operationName(operation)} | ${cellsOfOthers.join(' | ')} |`;
    }),
  ).join('\n');

  const toReference = results.rows.map(({ medians: ms }) =>
    ratioOf(ms[subjectIndex] ?? Number.NaN, ms[referenceIndex] ?? Number.NaN),
  );

  const environment =
    locale === 'en'
      ? (`Measured in \`${results.userAgent}\`. Each figure is the median of ${results.runs} runs, each measuring the libraries in a different order and each itself the median of its timed runs.` as const)
      : (`計測環境は \`${results.userAgent}\`。各値は ${results.runs} 回の実行の中央値で、実行ごとにライブラリを計る順番を変え、各実行の値もその中で計った回の中央値である。` as const);

  return {
    environment: { text: environment, block: true },
    medians: { text: medians, block: true },
    ratios: { text: ratios, block: true },
    'reference-min': {
      text: Math.min(...toReference).toFixed(2),
      block: false,
    },
    'reference-max': {
      text: Math.max(...toReference).toFixed(2),
      block: false,
    },
  };
};

const ratio = (value: number, base: number): string =>
  `${ratioOf(value, base).toFixed(2)}×` as const;

/** `parseResults` has already rejected a median that is not positive. */
const ratioOf = (value: number, base: number): number =>
  Num.isNonZero(base) ? Num.div(value, base) : Number.NaN;

/**
 * Replaces the content of every `<!-- benchmark:<key> -->…<!-- /benchmark -->`
 * span. A key the page uses and `values` lacks is an error, and so is a key in
 * `values` the page never uses: a table that quietly stopped being embedded is
 * the drift this script exists to prevent.
 */
const embedInto = (
  page: string,
  values: ReadonlyRecord<string, Embedded>,
): Result<string, string> => {
  const mut_used = new Set<string>();

  const mut_missing: string[] = [];

  const replaced = page.replaceAll(
    /<!-- benchmark:(?<key>[\w-]+) -->[\s\S]*?<!-- \/benchmark -->/gu,
    (match, key: string | undefined) => {
      const value = key === undefined ? undefined : values[key];

      if (key === undefined || value === undefined) {
        mut_missing.push(key ?? match);

        return match;
      }

      mut_used.add(key);

      return value.block
        ? `<!-- benchmark:${key} -->\n\n${value.text}\n\n<!-- /benchmark -->`
        : `<!-- benchmark:${key} -->${value.text}<!-- /benchmark -->`;
    },
  );

  if (Arr.isNonEmpty(mut_missing)) {
    return Result.err(
      `no value for ${mut_missing.map((key) => `"benchmark:${key}"`).join(', ')}`,
    );
  }

  const unused = Object.keys(values).filter((key) => !mut_used.has(key));

  if (Arr.isNonEmpty(unused)) {
    return Result.err(
      `the page has no marker for ${unused.map((key) => `"benchmark:${key}"`).join(', ')}`,
    );
  }

  return Result.ok(replaced);
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedBenchmark();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
