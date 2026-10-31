import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Num, Result, unknownToString } from 'ts-data-forge';
import { formatFiles, isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { embedInto, type Embedded } from './embed-markers.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Embeds `apps/synstate-dom-benchmark/RESULTS.md` into the benchmark pages.
 *
 * RESULTS.md is written by that app's `pnpm run benchmark`, by hand, and is the
 * only record of a run. The pages carry no number of their own: every figure on
 * them sits between a pair of `<!-- benchmark:<key> -->` markers and is
 * rewritten from RESULTS.md here, so that a re-run reaches the site by
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

      const embedded = embedInto(
        page,
        'benchmark',
        render(parsed.value, locale),
      );

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
  operations: Table;
  scenarios: Table;
}>;

/**
 * One of RESULTS.md's tables of medians. A scenario's median is `NaN` where the
 * library rendered the wrong figures, which RESULTS.md writes `wrong`.
 */
type Table = Readonly<{
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
  'loan: build the table': 'ローン：表を作る',
  'loan: change the interest rate': 'ローン：金利を変える',
  'loan: prepay in month 181': 'ローン：181 か月目に繰上返済する',
  'loan: prepay in month 349': 'ローン：349 か月目に繰上返済する',
  'schedule: build the schedule': '工程表：工程表を作る',
  'schedule: lengthen the first task': '工程表：最初のタスクを延ばす',
  'schedule: lengthen a task in the middle': '工程表：中ほどのタスクを延ばす',
  'schedule: lengthen a task near the end':
    '工程表：終わり近くのタスクを延ばす',
  'zoom: build the map': 'ズーム：地図を作る',
  'zoom: zoom within a level': 'ズーム：同じ段階の中でズームする',
  'zoom: zoom to the next level': 'ズーム：次の段階までズームする',
} as const;

/** What RESULTS.md writes in place of a time for the wrong figures. */
const wrong = 'wrong';

const cells = (line: string): readonly string[] =>
  line
    .replace(/^\|/u, '')
    .replace(/\|$/u, '')
    .split('|')
    .map((cell) => cell.trim());

/**
 * Reads the first table at or after line `from`. Where `wrongAllowed`, a
 * `wrong` cell is read as `NaN`; any other cell must be a positive number.
 */
const parseTable = (
  lines: readonly string[],
  from: number,
  wrongAllowed: boolean,
): Result<Table, string> => {
  const tableStart = lines.findIndex(
    (line, i) => i >= from && line.startsWith('|'),
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
    return Result.err('no result table was found');
  }

  const libraries = Arr.tail(cells(header));

  const mut_rows: Table['rows'][number][] = [];

  for (const line of body) {
    const [operation, ...values] = cells(line);

    const medians = values.map((value) =>
      wrongAllowed && value === wrong
        ? Number.NaN
        : Result.unwrapOkOr(Num.safeParseFloat(value), Number.NaN),
    );

    if (
      operation === undefined ||
      medians.length !== libraries.length ||
      medians.some(
        (m, i) =>
          !(Number.isFinite(m) && m > 0) &&
          !(wrongAllowed && values[i] === wrong),
      )
    ) {
      return Result.err(`a row could not be read: ${line}`);
    }

    mut_rows.push({ operation, medians });
  }

  return Result.ok({ libraries, rows: mut_rows });
};

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

  // The medians of the operations, the first table, and those of the scenarios,
  // the first table after their heading. RESULTS.md's ratio tables are
  // recomputed below, so that the Japanese page can head them in
  // Japanese.
  const lines = markdown.split('\n').map((line) => line.trim());

  const operations = parseTable(lines, 0, false);

  if (Result.isErr(operations)) {
    return operations;
  }

  const scenariosHeading = lines.indexOf('## Scenarios');

  if (scenariosHeading === -1) {
    return Result.err('the "## Scenarios" section was not found');
  }

  const scenarios = parseTable(lines, scenariosHeading, true);

  if (Result.isErr(scenarios)) {
    return scenarios;
  }

  const { libraries } = operations.value;

  if (
    !libraries.includes(subject) ||
    !libraries.includes(reference) ||
    !scenarios.value.libraries.includes(subject)
  ) {
    return Result.err(
      `a table has no "${subject}" column, or the first no "${reference}" column`,
    );
  }

  return Result.ok({
    userAgent,
    runs: Result.unwrapOkOr(Num.safeParseFloat(runs), Number.NaN),
    operations: operations.value,
    scenarios: scenarios.value,
  });
};

/** `parseResults` has already rejected a median that is not positive. */
const ratioOf = (value: number, base: number): number =>
  Num.isNonZero(base) ? Num.div(value, base) : Number.NaN;

/** A dash where either time is missing (`wrong`). */
const ratio = (value: number, base: number): string =>
  Number.isNaN(value) || Number.isNaN(base)
    ? '–'
    : (`${ratioOf(value, base).toFixed(2)}×` as const);

/** What each marker on a page is replaced with. */
const render = (
  results: Results,
  locale: Locale,
): ReadonlyRecord<string, Embedded> => {
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

  const wrongCell = locale === 'en' ? 'wrong' : '誤り';

  const medians = (table: Table): string =>
    [
      `| ${locale === 'en' ? 'operation (median ms)' : '操作（中央値 ms）'} | ${table.libraries.join(' | ')} |`,
      `| :-- | ${table.libraries.map(() => '--:').join(' | ')} |`,
      ...table.rows.map(
        ({ operation, medians: ms }) =>
          `| ${operationName(operation)} | ${ms.map((m) => (Number.isNaN(m) ? wrongCell : m.toFixed(2))).join(' | ')} |`,
      ),
    ].join('\n');

  const ratios = (table: Table): string => {
    const subjectIndex = table.libraries.indexOf(subject);

    const others = table.libraries.filter((library) => library !== subject);

    return [
      `| ${locale === 'en' ? 'operation' : '操作'} | ${others.join(' | ')} |`,
      `| :-- | ${others.map(() => '--:').join(' | ')} |`,
      ...table.rows.map(({ operation, medians: ms }) => {
        const subjectMs = ms[subjectIndex] ?? Number.NaN;

        const cellsOfOthers = ms
          .filter((_, i) => i !== subjectIndex)
          .map((m) => ratio(m, subjectMs));

        return `| ${operationName(operation)} | ${cellsOfOthers.join(' | ')} |`;
      }),
    ].join('\n');
  };

  const { operations } = results;

  const subjectColumn = operations.libraries.indexOf(subject);

  const referenceColumn = operations.libraries.indexOf(reference);

  const toReference = operations.rows.map(({ medians: ms }) =>
    ratioOf(ms[subjectColumn] ?? Number.NaN, ms[referenceColumn] ?? Number.NaN),
  );

  const environment =
    locale === 'en'
      ? (`Measured in \`${results.userAgent}\`. Each figure is the median of ${results.runs} runs, each measuring the libraries in a different order and each itself the median of its timed runs.` as const)
      : (`計測環境は \`${results.userAgent}\` です。各値は ${results.runs} 回の実行の中央値です。実行ごとにライブラリを計る順番を変えていて、各実行の値もその中で計った回の中央値です。` as const);

  return {
    environment: { text: environment, block: true },
    medians: { text: medians(operations), block: true },
    ratios: { text: ratios(operations), block: true },
    'scenario-medians': { text: medians(results.scenarios), block: true },
    'scenario-ratios': { text: ratios(results.scenarios), block: true },
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

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedBenchmark();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
