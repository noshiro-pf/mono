import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Obj, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
// eslint-disable-next-line import-x/no-relative-packages -- tools/ is not a package; this is how apps reach its shared scripts
import * as markers from '../../../tools/scripts/lib/embed-markers.mjs';
// eslint-disable-next-line import-x/no-relative-packages -- tools/ is not a package; this is how apps reach its shared scripts
import * as domResults from '../../../tools/scripts/lib/synstate-dom-benchmark-results.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';
import { writePages } from './write-pages.mjs';

/**
 * Embeds `apps/synstate-dom-benchmark/RESULTS-NEXT.md` into the pages that
 * quote it, between `<!-- benchmark:<key> -->` markers, as synstate-dom-docs'
 * `gen:benchmark` embeds RESULTS.md: a re-run of `benchmark:repeat -- --next`
 * reaches the site by `pnpm run gen`.
 *
 * Each page gets the values of the markers `pages` lists for it. The tables are parsed and
 * rendered again, so that the Japanese pages name the operations in Japanese;
 * an operation with no Japanese name is an error.
 */
export const embedBenchmark = async (): Promise<Result<undefined, string>> => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const markdown = await fs.readFile(resultsPath, 'utf8');

    const results = domResults.parseResults(markdown);

    if (Result.isErr(results)) {
      return Result.err(`❌ ${resultsPath}: ${results.value}`);
    }

    const { operations, scenarios } = results.value;

    const tables = { operations, scenarios } as const;

    // What the prose reads by name, so that a renamed column or row, or a
    // library that rendered the wrong figures, is reported as such rather than
    // as a sentence the figures no longer bear out.
    const missing = [
      ...(['operations', 'scenarios'] as const).flatMap((name) =>
        libraries
          .filter((library) =>
            tables[name].libraries.every((column) => column !== library),
          )
          .map((library) => `the ${name} table has no "${library}" column`),
      ),
      ...namedRows
        .filter(([name, operation]) =>
          tables[name].rows.every((row) => row.operation !== operation),
        )
        .map(
          ([name, operation]) =>
            `the ${name} table has no "${operation}" row; update \`claims\` or \`buildOperations\` in scripts/embed-benchmark.mts`,
        ),
      // A build row may be `wrong`: it only leaves the fastest build.
      ...comparedRows.flatMap(([name, operation]) =>
        libraries
          .filter((library) =>
            Number.isNaN(timeOf(tables[name], operation, library)),
          )
          .map(
            (library) =>
              `${library} rendered the wrong figures in "${operation}", which a sentence of background/benchmark.md compares; fix the library and re-run the benchmark`,
          ),
      ),
    ] as const;

    if (Arr.isNonEmpty(missing)) {
      return Result.err(
        `❌ ${resultsPath}:\n${missing.map((m) => `  - ${m}`).join('\n')}`,
      );
    }

    const unsupported = claims.filter(
      (claim) =>
        !claim.holds(
          (operation, library) =>
            timeOf(tables[claim.table], operation, library),
          claim.operations,
        ),
    );

    if (Arr.isNonEmpty(unsupported)) {
      return Result.err(
        `❌ ${resultsPath}: the tables no longer bear out these sentences of background/benchmark.md; reword them on both pages and update \`claims\`:\n${unsupported.map((claim) => `  - ${claim.en}`).join('\n')}`,
      );
    }

    const en = render(results.value, 'en');

    if (Result.isErr(en)) {
      return Result.err(`❌ ${resultsPath}: ${en.value}`);
    }

    const ja = render(results.value, 'ja');

    if (Result.isErr(ja)) {
      return Result.err(`❌ ${resultsPath}: ${ja.value}`);
    }

    // Every page is embedded before any is written, so that a failure writes
    // none of them.
    const mut_embedded: FixedLengthTuple<2, string>[] = [];

    for (const [pagePath, keys, hasClaims] of pages) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const page = await fs.readFile(pagePath, 'utf8');

      const locale = domResults.pageLocale(pagePath);

      const absent = hasClaims
        ? claims.map((claim) => claim[locale]).filter((t) => !page.includes(t))
        : ([] as const);

      if (Arr.isNonEmpty(absent)) {
        return Result.err(
          `❌ ${pagePath}: these sentences were reworded or removed; update \`claims\` in scripts/embed-benchmark.mts to match:\n${absent.map((text) => `  - ${text}`).join('\n')}`,
        );
      }

      // `embedInto` fails on a marker with no value and on a value with no
      // marker, so a marker removed or misspelt fails too.
      const embedded = markers.embedInto(
        page,
        'benchmark',
        Obj.filter((locale === 'en' ? en : ja).value, (_value, key) =>
          keys.includes(key),
        ),
      );

      if (Result.isErr(embedded)) {
        return Result.err(`❌ ${pagePath}: ${embedded.value}`);
      }

      mut_embedded.push([pagePath, embedded.value]);
    }

    return await writePages(mut_embedded, 'RESULTS-NEXT.md');
  } catch (error) {
    return Result.err(`❌ ${unknownToString(error)}`);
  }
};

const resultsPath = path.resolve(
  workspaceRootPath,
  '../synstate-dom-benchmark/RESULTS-NEXT.md',
);

/** The library this site is about; RESULTS-NEXT.md's ratios are to synstate-dom. */
const subject = 'synstate-dom-next';

/** The columns the pages read. */
const libraries = [subject, domResults.subject, domResults.reference] as const;

/** Every marker a page can have. */
const benchmarkKeys = [
  'environment',
  'medians',
  'ratios',
  'scenario-medians',
  'scenario-ratios',
  'next-over-dom-min',
  'next-over-dom-max',
  'next-over-solid-max',
  'build-next-over-dom-min',
] as const;

type BenchmarkKey = (typeof benchmarkKeys)[number];

const docsDir = path.resolve(workspaceRootPath, 'src/content/docs');

/**
 * Each page, in English and Japanese, the markers it has, and whether it has
 * the sentences of `claims`.
 */
const pages: readonly (readonly [
  pagePath: string,
  keys: readonly BenchmarkKey[],
  hasClaims: boolean,
])[] = (
  [
    ['index.mdx', ['next-over-solid-max'], false],
    ['getting-started/introduction.md', ['next-over-solid-max'], false],
    ['background/benchmark.md', benchmarkKeys, true],
  ] as const
).flatMap(([page, keys, hasClaims]) => [
  [path.resolve(docsDir, page), keys, hasClaims],
  [path.resolve(docsDir, 'ja', page), keys, hasClaims],
]);

/**
 * The scenario rows that build a screen today. `build-next-over-dom-min` spans
 * every row whose name has `: build`; these have to be among them, so that a
 * renamed one is reported rather than left out.
 */
const buildOperations = [
  'loan: build the table',
  'schedule: build the schedule',
  'zoom: build the map',
] as const;

type TableName = 'operations' | 'scenarios';

/**
 * A sentence of background/benchmark.md that the tables could stop bearing out,
 * as it reads on each page, the rows of `table` it is about, and whether those
 * rows bear it out. A sentence about an order or a margin gets a case here; a
 * figure gets a marker instead.
 */
type Claim = Readonly<{
  en: string;
  ja: string;
  table: TableName;
  operations: readonly string[];
  /** `time(operation, library)` is a median of `table`. */
  holds: (
    time: (operation: string, library: string) => number,
    operations: readonly string[],
  ) => boolean;
}>;

const claims: readonly Claim[] = [
  {
    en: '**Creating and clearing rows** costs less per row.',
    ja: '**行の作成と全消去**は、行あたりのコストが下がります。',
    table: 'operations',
    operations: ['create 1,000 rows', 'create 10,000 rows', 'clear 1,000 rows'],
    holds: (time, operations) =>
      operations.every(
        (operation) =>
          time(operation, subject) < time(operation, domResults.subject),
      ),
  },
  {
    en: 'What remains between it and Solid is template cloning',
    ja: 'Solid との残りの差はテンプレートの複製です',
    table: 'operations',
    operations: ['create 1,000 rows', 'create 10,000 rows'],
    holds: (time, operations) =>
      operations.every(
        (operation) =>
          time(operation, domResults.reference) < time(operation, subject),
      ),
  },
  {
    en: '**Selecting a row** writes to two rows through `selector`',
    ja: '**行の選択**は、Solid の `createSelector` と同じく `selector` で 2 行だけに書き込みます。',
    table: 'operations',
    operations: ['select a row'],
    holds: (time, operations) =>
      operations.every(
        (operation) =>
          time(operation, subject) < time(operation, domResults.subject),
      ),
  },
  {
    en: "is where the scheduler's cost per node shows",
    ja: 'スケジューラーのノードあたりのコストが表に出ます',
    table: 'scenarios',
    operations: [
      'loan: change the interest rate',
      'schedule: lengthen the first task',
      'zoom: zoom to the next level',
    ],
    holds: (time, operations) =>
      operations.every((operation) =>
        [domResults.subject, domResults.reference].every(
          (library) => time(operation, subject) < time(operation, library),
        ),
      ),
  },
  {
    en: 'is cheap for both generations of synstate',
    ja: 'synstate のどちらの世代でも安く済みます',
    table: 'scenarios',
    operations: [
      'schedule: lengthen a task in the middle',
      'zoom: zoom within a level',
    ],
    holds: (time, operations) =>
      operations.every((operation) =>
        [subject, domResults.subject].every(
          (library) =>
            time(operation, library) < time(operation, domResults.reference),
        ),
      ),
  },
] as const;

/** The rows a sentence compares, each once, with the table it is in. */
const comparedRows: readonly (readonly [TableName, string])[] = Arr.uniqBy(
  claims.flatMap(({ table, operations }) =>
    operations.map((operation) => [table, operation] as const),
  ),
  ([table, operation]) => `${table}: ${operation}`,
);

/** Every row the prose reads by name, each once, with the table it is in. */
const namedRows: readonly (readonly [TableName, string])[] = [
  ...comparedRows,
  ...buildOperations.map((operation) => ['scenarios', operation] as const),
] as const;

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

/** A dash where either time is missing (`wrong`). */
const ratio = (value: number, base: number): string =>
  Number.isNaN(value) || Number.isNaN(base)
    ? '–'
    : (`${domResults.ratioOf(value, base).toFixed(2)}×` as const);

/** The ratios of `subject`'s medians to `base`'s, one per operation. */
const ratiosTo = (table: domResults.Table, base: string): readonly number[] => {
  const subjectColumn = table.libraries.indexOf(subject);

  const baseColumn = table.libraries.indexOf(base);

  return table.rows.map(({ medians }) =>
    domResults.ratioOf(
      medians[subjectColumn] ?? Number.NaN,
      medians[baseColumn] ?? Number.NaN,
    ),
  );
};

/** `library`'s median for `operation`; `NaN` where it is missing or `wrong`. */
const timeOf = (
  table: domResults.Table,
  operation: string,
  library: string,
): number =>
  table.rows.find((row) => row.operation === operation)?.medians[
    table.libraries.indexOf(library)
  ] ?? Number.NaN;

/** What each marker on a page may be replaced with. */
const render = (
  results: domResults.Results,
  locale: domResults.Locale,
): Result<ReadonlyRecord<BenchmarkKey, markers.Embedded>, string> => {
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

  const medians = (table: domResults.Table): string =>
    [
      `| ${locale === 'en' ? 'operation (median ms)' : '操作（中央値 ms）'} | ${table.libraries.join(' | ')} |`,
      `| :-- | ${table.libraries.map(() => '--:').join(' | ')} |`,
      ...table.rows.map(
        ({ operation, medians: ms }) =>
          `| ${operationName(operation)} | ${ms.map((m) => (Number.isNaN(m) ? wrongCell : m.toFixed(2))).join(' | ')} |`,
      ),
    ].join('\n');

  // Every library against synstate-dom, the generation this one replaces.
  const ratios = (table: domResults.Table): string => {
    const baseIndex = table.libraries.indexOf(domResults.subject);

    const others = table.libraries.filter(
      (library) => library !== domResults.subject,
    );

    return [
      `| ${locale === 'en' ? 'operation' : '操作'} | ${others.join(' | ')} |`,
      `| :-- | ${others.map(() => '--:').join(' | ')} |`,
      ...table.rows.map(({ operation, medians: ms }) => {
        const baseMs = ms[baseIndex] ?? Number.NaN;

        const cells = ms
          .filter((_, i) => i !== baseIndex)
          .map((m) => ratio(m, baseMs));

        return `| ${operationName(operation)} | ${cells.join(' | ')} |`;
      }),
    ].join('\n');
  };

  const { operations, scenarios } = results;

  const overDom = ratiosTo(operations, domResults.subject);

  const overSolid = ratiosTo(operations, domResults.reference);

  // Every build row; one where a library rendered the wrong figures has no
  // ratio.
  const buildOverDom = ratiosTo(scenarios, domResults.subject).filter(
    (r, i) =>
      scenarios.rows[i]?.operation.includes(': build') === true &&
      !Number.isNaN(r),
  );

  // parseResults allows no `wrong` in the operations table.
  if (
    !Arr.isNonEmpty(buildOverDom) ||
    [...overDom, ...overSolid].some((r) => !Number.isFinite(r))
  ) {
    return Result.err(
      'a ratio the prose quotes could not be computed: a time in the operations table is missing, or every build row is `wrong`',
    );
  }

  const environment =
    locale === 'en'
      ? (`Measured in \`${results.userAgent}\`. Each figure is the median of ${results.runs} runs, each measuring the libraries in a different order and each itself the median of its timed runs.` as const)
      : (`計測環境は \`${results.userAgent}\` です。各値は ${results.runs} 回の実行の中央値です。実行ごとにライブラリを計る順番を変えていて、各実行の値もその中で計った回の中央値です。` as const);

  const inline = (value: number): markers.Embedded =>
    ({
      text: value.toFixed(2),
      block: false,
    }) as const;

  return Result.ok({
    environment: { text: environment, block: true },
    medians: { text: medians(operations), block: true },
    ratios: { text: ratios(operations), block: true },
    'scenario-medians': { text: medians(scenarios), block: true },
    'scenario-ratios': { text: ratios(scenarios), block: true },
    'next-over-dom-min': inline(Math.min(...overDom)),
    'next-over-dom-max': inline(Math.max(...overDom)),
    'next-over-solid-max': inline(Math.max(...overSolid)),
    'build-next-over-dom-min': inline(Math.min(...buildOverDom)),
  });
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedBenchmark();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
