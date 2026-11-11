import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
// eslint-disable-next-line import-x/no-relative-packages -- tools/ is not a package; this is how apps reach its shared scripts
import { formatPackage } from '../../../tools/configs/format-package.mjs';
// eslint-disable-next-line import-x/no-relative-packages -- tools/ is not a package; this is how apps reach its shared scripts
import * as markers from '../../../tools/scripts/lib/embed-markers.mjs';
// eslint-disable-next-line import-x/no-relative-packages -- tools/ is not a package; this is how apps reach its shared scripts
import * as domResults from '../../../tools/scripts/lib/synstate-dom-benchmark-results.mjs';
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
 *
 * The introduction and the landing page quote synstate-dom's place among the
 * libraries too, beside SynState's own benchmark; the SynState site's
 * `gen:benchmark-doc` fills both kinds of figure there, so that each page has
 * one writer, and `check:prose:synstate-dom-placement` checks them.
 */
export const embedBenchmark = async (): Promise<Result<undefined, string>> => {
  try {
    const results = await domResults.readResults();

    if (Result.isErr(results)) {
      return Result.err(`❌ ${results.value}`);
    }

    const placed = domResults.checkPlacement(results.value.operations);

    if (Result.isErr(placed)) {
      return Result.err(`❌ ${placed.value}`);
    }

    // Every page is embedded before any is written, so that a failure to embed
    // writes none of them. The tables go in unaligned, so both pages are
    // written and then formatted back on every run; a Prettier failure leaves
    // them unformatted, which the next run or `fix:fmt` repairs.
    const mut_embedded: FixedLengthTuple<2, string>[] = [];

    for (const [locale, pagePath] of pages) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const page = await fs.readFile(pagePath, 'utf8');

      const embedded = markers.embedInto(
        page,
        'benchmark',
        render(results.value, locale),
      );

      if (Result.isErr(embedded)) {
        return Result.err(`❌ ${pagePath}: ${embedded.value}`);
      }

      mut_embedded.push([pagePath, embedded.value]);
    }

    for (const [pagePath, content] of mut_embedded) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(pagePath, content, 'utf8');
    }

    const written = mut_embedded.map(([pagePath]) =>
      path.relative(workspaceRootPath, pagePath),
    );

    const status = await formatPackage({
      cwd: workspaceRootPath,
      patterns: written,
    });

    if (status !== 0) {
      return Result.err(`❌ Prettier failed on ${written.join(', ')}`);
    }

    console.info(`✓ Embedded RESULTS.md into ${written.join(', ')}`);

    return Result.ok(undefined);
  } catch (error) {
    return Result.err(`❌ ${unknownToString(error)}`);
  }
};

const pages: readonly (readonly [domResults.Locale, string])[] =
  domResults.benchmarkPages.map(
    (page) => [domResults.pageLocale(page), page] as const,
  );

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

/** What each marker on a page is replaced with. */
const render = (
  results: domResults.Results,
  locale: domResults.Locale,
): ReadonlyRecord<string, markers.Embedded> => {
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

  const ratios = (table: domResults.Table): string => {
    const subjectIndex = table.libraries.indexOf(domResults.subject);

    const others = table.libraries.filter(
      (library) => library !== domResults.subject,
    );

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

  const subjectColumn = operations.libraries.indexOf(domResults.subject);

  const referenceColumn = operations.libraries.indexOf(domResults.reference);

  const toReference = operations.rows.map(({ medians: ms }) =>
    domResults.ratioOf(
      ms[subjectColumn] ?? Number.NaN,
      ms[referenceColumn] ?? Number.NaN,
    ),
  );

  const cases = domResults.worstCases(operations);

  const worstTable = [
    locale === 'en'
      ? '| library | slowest operation | × the fastest library |'
      : '| ライブラリ | 最も遅い操作 | 最速のライブラリに対する倍率 |',
    '| :-- | :-- | --: |',
    ...cases.map(
      ({ library, operation, overFastest }) =>
        `| ${library} | ${operationName(operation)} | ${overFastest.toFixed(2)}× |`,
    ),
  ].join('\n');

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
    'worst-cases': { text: worstTable, block: true },
    ...domResults.placementFigures(operations, locale),
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
