import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Num, Optional, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
// eslint-disable-next-line import-x/no-relative-packages -- tools/ is not a package; this is how apps reach its shared scripts
import { formatPackage } from '../../../tools/configs/format-package.mjs';
// eslint-disable-next-line import-x/no-relative-packages -- tools/ is not a package; this is how apps reach its shared scripts
import * as markers from '../../../tools/scripts/lib/embed-markers.mjs';
import {
  type BenchmarkResults,
  parseResults,
  type ScenarioResult,
} from './benchmark/results.mjs';
import {
  isNaiveForm,
  isPredecessor,
  isSubject,
  libraryOf,
  predecessorOf,
  resultsPath,
  type ScenarioId,
  scenarios,
  subjectLabel,
} from './benchmark/scenarios.mjs';
import {
  median,
  ROUNDS,
  STATS_RUNS_PER_ROW,
  STATS_UPDATES,
  TIMEOUT_MS,
} from './benchmark/time-entry.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Embeds `src/data/benchmark-results.json`, which `pnpm run benchmark` writes,
 * into the benchmark page and its translation, between
 * `<!-- benchmark:<key> -->` markers: the tables, and every figure the prose
 * quotes.
 *
 * The prose also makes claims no figure states, such as which library is the
 * fastest somewhere. Each is listed in {@link claims} with a check, and a
 * measurement that no longer bears one out stops this script with the sentence
 * named, rather than leaving the page to say what the tables contradict.
 */
export const embedBenchmark = async (): Promise<Result<undefined, string>> => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const parsed = parseResults(await fs.readFile(resultsPath, 'utf8'));

    if (Result.isErr(parsed)) {
      return Result.err(`❌ ${resultsPath}: ${parsed.value}`);
    }

    const data = analyse(parsed.value);

    if (Result.isErr(data)) {
      return Result.err(`❌ ${resultsPath}: ${data.value}`);
    }

    const unsupported = claims.filter((claim) => !claim.holds(data.value));

    if (Arr.isNonEmpty(unsupported)) {
      return Result.err(
        `❌ ${resultsPath}: the measurement no longer bears out these sentences of comparison/benchmark.md; reword them on both pages and update \`claims\` in scripts/embed-benchmark.mts:\n${unsupported.map((claim) => `  - ${claim.en}`).join('\n')}`,
      );
    }

    const mut_pages: FixedLengthTuple<2, string>[] = [];

    for (const locale of ['en', 'ja'] as const) {
      const pagePath = path.resolve(
        docsDir,
        locale === 'en' ? '' : 'ja',
        'comparison/benchmark.md',
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const page = await fs.readFile(pagePath, 'utf8');

      const absent = claims
        .map((claim) => claim[locale])
        .filter(
          (text) => !markers.stripMarkers(page, 'benchmark').includes(text),
        );

      if (Arr.isNonEmpty(absent)) {
        return Result.err(
          `❌ ${pagePath}: these sentences were reworded or removed; update \`claims\` in scripts/embed-benchmark.mts to match:\n${absent.map((text) => `  - ${text}`).join('\n')}`,
        );
      }

      const embedded = markers.embedInto(
        page,
        'benchmark',
        render(parsed.value, data.value, locale),
      );

      if (Result.isErr(embedded)) {
        return Result.err(`❌ ${pagePath}: ${embedded.value}`);
      }

      mut_pages.push([pagePath, embedded.value]);
    }

    for (const [pagePath, content] of mut_pages) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(pagePath, content, 'utf8');
    }

    const written = mut_pages.map(([pagePath]) =>
      path.relative(workspaceRootPath, pagePath),
    );

    if (
      (await formatPackage({ cwd: workspaceRootPath, patterns: written })) !== 0
    ) {
      return Result.err(`❌ Prettier failed on ${written.join(', ')}`);
    }

    console.info(`✓ Embedded the benchmark into ${written.join(', ')}`);

    return Result.ok(undefined);
  } catch (error) {
    return Result.err(`❌ ${unknownToString(error)}`);
  }
};

type Locale = 'en' | 'ja';

/**
 * One library in one scenario, at the point the summary reads: its time in ms,
 * or `null` when it ran out of time there.
 */
type Cell = Readonly<{ label: string; ms: number | null }>;

/** A scenario as the summary reads it. */
type ScenarioSummary = Readonly<{
  id: ScenarioId;
  /**
   * The rows the summary compares: every one but the naive forms and
   * synstate's.
   */
  cells: readonly Cell[];
  fastest: Cell & Readonly<{ ms: number }>;
  slowest: Cell;
  subject: Cell & Readonly<{ ms: number }>;
  /** synstate's row in the form of `subject`. */
  predecessor: Cell;
}>;

type Analysis = Readonly<{
  summaries: readonly ScenarioSummary[];
  /** Each library's scenario where it is furthest from the fastest. */
  worst: readonly Readonly<{
    library: string;
    scenario: ScenarioSummary;
    cell: Cell;
    /** Its time divided by the fastest's; a lower bound for a timeout. */
    ratio: number;
  }>[];
  /** A row's times (ms) at every point of a scenario, `null` past a timeout. */
  row: (id: ScenarioId, label: string) => readonly (number | null)[];
  /** A row's time (ms) at one point of a sweep, `null` past a timeout. */
  at: (id: ScenarioId, label: string, point: string) => number | null;
  /** The points of a sweep, as its table heads them. */
  points: (id: ScenarioId) => readonly string[];
}>;

/**
 * A sentence of the page that no embedded figure states, with the check that
 * the measurement still bears it out. `en` and `ja` are the sentence as each
 * page has it, outside any marker.
 */
type Claim = Readonly<{
  en: string;
  ja: string;
  holds: (analysis: Analysis) => boolean;
}>;

/** The point of each sweep that the summary reads. */
const summaryPoints: ReadonlyRecord<string, string> = {
  'deep-chain': 'K=1000, M=200',
  'cascaded-diamond': 'N=20',
  'conditional-fan-out': 'B=1000',
  'unchanged-value': 'W=50',
} as const;

const smallGraphIds = ['single-state', 'derived-chain', 'diamond'] as const;

const docsDir = path.resolve(workspaceRootPath, 'src/content/docs');

const scenarioNames: ReadonlyRecord<
  ScenarioId,
  ReadonlyRecord<Locale, string>
> = {
  'single-state': { en: 'Single state', ja: '単一の状態' },
  'derived-chain': { en: 'Derived chain', ja: '派生のチェーン' },
  diamond: { en: 'Diamond', ja: 'ダイヤモンド' },
  'deep-chain': { en: 'Deep chain', ja: '深いチェーン' },
  'cascaded-diamond': { en: 'Cascaded diamond', ja: '連なったダイヤモンド' },
  'conditional-fan-out': { en: 'Conditional fan-out', ja: '条件付きの分岐' },
  'unchanged-value': { en: 'Unchanged value', ja: '変わらない値' },
} as const;

const texts = {
  en: {
    scenario: 'Scenario',
    fastest: 'Fastest',
    subjectOverFastest: 'synstate-next ÷ fastest',
    slowest: 'Slowest',
    slowestOverFastest: 'Slowest ÷ fastest',
    subjectOverPredecessor: 'synstate-next ÷ synstate',
    library: 'Library',
    trailsMost: 'Scenario where it trails most',
    fastestThere: 'Fastest there',
    libraryOverFastest: 'Library ÷ fastest',
    median: 'Median (ms)',
    p95: 'p95 (ms)',
    perSecond: 'Updates per second',
    overSubject: '÷ synstate-next',
    msHeader: (label: string) => `${label} (ms)`,
    runner: 'Runner',
    libraries: 'Libraries',
    measuredOn: 'Measured',
  },
  ja: {
    scenario: 'シナリオ',
    fastest: '最速',
    subjectOverFastest: 'synstate-next ÷ 最速',
    slowest: '最遅',
    slowestOverFastest: '最遅 ÷ 最速',
    subjectOverPredecessor: 'synstate-next ÷ synstate',
    library: 'ライブラリ',
    trailsMost: '最も遅れるシナリオ',
    fastestThere: 'そこでの最速',
    libraryOverFastest: 'ライブラリ ÷ 最速',
    median: '中央値 (ms)',
    p95: 'p95 (ms)',
    perSecond: '1 秒あたりの更新',
    overSubject: '÷ synstate-next',
    msHeader: (label: string) => `${label} (ms)`,
    runner: '実行環境',
    libraries: 'ライブラリ',
    measuredOn: '計測日',
  },
} as const;

const claims: readonly Claim[] = [
  {
    en: 'The fastest do less per write.',
    ja: '最速のライブラリは書き込みごとの処理が少ないものです。',
    // The sentences after it name these two.
    holds: (analysis) =>
      smallGraphIds.every((id) =>
        ['RxJS', 'Preact Signals'].includes(
          summaryOf(analysis, id).fastest.label,
        ),
      ),
  },
  {
    en: 'Solid, MobX, Jotai and Redux take longer than synstate-next in all three.',
    ja: 'Solid、MobX、Jotai、Redux は 3 つすべてで synstate-next より時間がかかります。',
    holds: (analysis) =>
      smallGraphIds.every((id) => {
        const { cells, subject } = summaryOf(analysis, id);

        return ['Solid', 'MobX', 'Jotai', 'Redux'].every((library) =>
          cells.some(
            (cell) => cell.label === library && msOf(cell) > subject.ms,
          ),
        );
      }),
  },
  {
    en: "Of all the libraries, RxJS's time grows the most as the chain gets deeper.",
    ja: 'チェーンが深くなったときに時間が最も伸びるのは RxJS です。',
    holds: (analysis) =>
      summaryOf(analysis, 'deep-chain').cells.every(
        ({ label }) =>
          label === 'RxJS' ||
          // A timed-out row's growth is only a lower bound.
          (!deepChainGrowth(analysis, label).timedOut &&
            deepChainGrowth(analysis, label).ratio <
              deepChainGrowth(analysis, 'RxJS').ratio),
      ),
  },
  {
    en: "synstate-next's time stays flat as $N$ grows.",
    ja: '$N$ が大きくなっても synstate-next の時間は伸びません。',
    holds: (analysis) =>
      staysFlat(analysis.row('cascaded-diamond', subjectLabel())),
  },
  {
    en: "Written with `switchMap`, synstate-next's time does not grow with $B$.",
    ja: '`switchMap` で書くと、synstate-next の時間は $B$ が増えても伸びません。',
    // The paragraph puts MobX, Solid and Preact Signals beside it.
    holds: (analysis) =>
      [subjectLabel('switchMap'), 'MobX', 'Solid', 'Preact Signals'].every(
        (label) => staysFlat(analysis.row('conditional-fan-out', label)),
      ),
  },
  {
    en: "as RxJS's does with `distinctUntilChanged`.",
    ja: '`distinctUntilChanged` を付けた RxJS も同じです。',
    holds: (analysis) =>
      [subjectLabel(), 'RxJS (distinctUntilChanged)'].every((label) =>
        staysFlat(analysis.row('unchanged-value', label)),
      ),
  },
  {
    en: 'The rows of Preact Signals, Solid, MobX, Jotai, Redux and RxJS without `distinctUntilChanged` grow with $W$.',
    ja: 'Preact Signals、Solid、MobX、Jotai、Redux、そして `distinctUntilChanged` なしの RxJS の行は、$W$ とともに伸びます。',
    holds: (analysis) =>
      [
        'Preact Signals',
        'Solid',
        'MobX',
        'Jotai',
        'Redux',
        'RxJS (naive, no distinctUntilChanged)',
      ].every((label) => grows(analysis.row('unchanged-value', label))),
  },
] as const;

/**
 * The first row of a `stats` scenario measured other than
 * {@link STATS_RUNS_PER_ROW} times. The page states how many times each library
 * was measured from `ROUNDS` and `STATS_RUNS`, so a file measured with others
 * would contradict it.
 */
export const miscountedRow = (
  result: ScenarioResult,
): Readonly<{ label: string; times: readonly number[] }> | undefined =>
  result.kind === 'stats'
    ? result.rows.find(({ times }) => times.length !== STATS_RUNS_PER_ROW)
    : undefined;

/**
 * A ratio as the tables show it: one decimal from 0.1 to 10, a whole number
 * above, and one significant figure below 0.1, where one decimal would read as
 * 0.0× (the column dividing synstate-next by synstate can go there). Written
 * out in full however small, never in exponent notation.
 */
export const formatRatio = (ratio: number, timedOut: boolean): string => {
  const text =
    ratio < 0.095
      ? ratio.toLocaleString('en-US', { maximumSignificantDigits: 1 })
      : ratio < 9.95
        ? ratio.toFixed(1)
        : Math.round(ratio).toLocaleString('en-US');

  return `${timedOut ? '> ' : ''}${text}×`;
};

/** A cell's time for ratios: a timeout counts as exactly the timeout. */
const msOf = (cell: Cell): number => cell.ms ?? TIMEOUT_MS;

/** `a / b`, infinite where `b` is zero. */
const over = (a: number, b: number): number =>
  Num.isNonZero(b) ? Num.div(a, b) : Number.POSITIVE_INFINITY;

/** Each row of `result` at `point`, or at its only point for a `stats` one. */
const cellsAt = (
  result: ScenarioResult,
  point: string | undefined,
): Result<readonly Cell[], string> => {
  if (result.kind === 'stats') {
    return Result.ok(
      result.rows.map(({ label, times }) => ({ label, ms: median(times) })),
    );
  }

  const index = result.xLabels.indexOf(point ?? '');

  if (index === -1) {
    return Result.err(`no point ${point ?? '(none)'} to summarize`);
  }

  return Result.ok(
    result.rows.map(({ label, values }) => ({
      label,
      ms: values[index] ?? null,
    })),
  );
};

/** What an error about the results file asks for. */
const REMEASURE =
  'measure again: dispatch `synstate-next-benchmark.yml` on the branch, or run `pnpm run benchmark` to try a change locally';

const analyse = (results: BenchmarkResults): Result<Analysis, string> => {
  const missing = scenarios.filter(
    ({ id }) => results.scenarios[id] === undefined,
  );

  if (Arr.isNonEmpty(missing)) {
    return Result.err(
      `no results for ${missing.map(({ id }) => id).join(', ')}; ${REMEASURE}`,
    );
  }

  const mut_summaries: ScenarioSummary[] = [];

  for (const { id, entries } of scenarios) {
    const result = results.scenarios[id];

    if (result === undefined) {
      return Result.err(`no results for ${id}`);
    }

    const measured = result.rows.map(({ label }) => label);

    const expected = entries.map(({ label }) => label);

    if (JSON.stringify(measured) !== JSON.stringify(expected)) {
      return Result.err(
        `${id} was measured with ${measured.join(', ')}, not ${expected.join(', ')}; ${REMEASURE}`,
      );
    }

    const miscounted = miscountedRow(result);

    if (miscounted !== undefined) {
      return Result.err(
        `${id}: ${miscounted.label} has ${miscounted.times.length.toString()} measured runs, not ${STATS_RUNS_PER_ROW.toString()} (ROUNDS × STATS_RUNS); ${REMEASURE}`,
      );
    }

    const cells = cellsAt(result, summaryPoints[id]);

    if (Result.isErr(cells)) {
      return Result.err(`${id}: ${cells.value}`);
    }

    const compared = cells.value.filter(
      ({ label }) => !isNaiveForm(label) && !isPredecessor(label),
    );

    const finished = Arr.generate(function* () {
      for (const cell of compared) {
        if (cell.ms !== null) {
          yield { ...cell, ms: cell.ms };
        }
      }
    });

    const fastest = Arr.minBy(finished, (cell) => cell.ms);

    const slowest = Arr.maxBy(compared, msOf);

    const subject = finished.find(({ label }) => isSubject(label));

    if (
      subject === undefined ||
      Optional.isNone(fastest) ||
      Optional.isNone(slowest)
    ) {
      return Result.err(`${id}: synstate-next or every library timed out`);
    }

    const predecessorRowLabel = predecessorOf(subject.label);

    const predecessor = cells.value.find(
      ({ label }) => label === predecessorRowLabel,
    );

    if (predecessor === undefined) {
      return Result.err(`${id}: no row ${predecessorRowLabel}`);
    }

    mut_summaries.push({
      id,
      cells: compared,
      fastest: Optional.unwrap(fastest),
      slowest: Optional.unwrap(slowest),
      subject,
      predecessor,
    });
  }

  const measuredLibraries = Arr.uniq(
    mut_summaries.flatMap(({ cells }) =>
      cells.map(({ label }) => libraryOf(label)),
    ),
  );

  const worst = Arr.generate(function* () {
    for (const library of measuredLibraries) {
      const candidates = Arr.generate(function* () {
        for (const scenario of mut_summaries) {
          for (const cell of scenario.cells) {
            if (libraryOf(cell.label) === library) {
              yield {
                library,
                scenario,
                cell,
                ratio: over(msOf(cell), scenario.fastest.ms),
              };
            }
          }
        }
      });

      const found = Arr.maxBy(candidates, (c) => c.ratio);

      if (Optional.isSome(found)) {
        yield Optional.unwrap(found);
      }
    }
  });

  const points = (id: ScenarioId): readonly string[] => {
    const result = results.scenarios[id];

    return result?.kind === 'series' ? result.xLabels : [];
  };

  const row = (id: ScenarioId, label: string): readonly (number | null)[] => {
    const result = results.scenarios[id];

    const values =
      result?.kind === 'stats'
        ? result.rows
            .filter((r) => r.label === label)
            .map(({ times }) => median(times))
        : result?.rows.find((r) => r.label === label)?.values;

    if (values === undefined || Arr.isEmpty(values)) {
      throw new Error(`no row ${label} in ${id}`);
    }

    return values;
  };

  return Result.ok({
    summaries: mut_summaries,
    worst,
    row,
    points,
    at: (id, label, point) => {
      const index = points(id).indexOf(point);

      const value = row(id, label)[index];

      if (index === -1 || value === undefined) {
        throw new Error(`no point ${point} in ${id}`);
      }

      return value;
    },
  });
};

const summaryOf = (analysis: Analysis, id: ScenarioId): ScenarioSummary => {
  const found = analysis.summaries.find((s) => s.id === id);

  if (found === undefined) {
    throw new Error(`no summary for ${id}`);
  }

  return found;
};

/** The scenario's name, linked to its section, with the point summarized. */
const scenarioLink = (id: ScenarioId, locale: Locale): string => {
  const name = scenarioNames[id][locale];

  const point = summaryPoints[id];

  // Starlight's heading ids: lower case, spaces as hyphens, which is all the
  // scenario names need. `check:prose:site-fragments` fails on a link to a
  // heading that does not exist.
  const anchor = name.toLowerCase().replaceAll(' ', '-');

  return `[${name}](#${anchor})${point === undefined ? '' : ` (${point})`}`;
};

const formatMs = (ms: number | null): string =>
  ms === null
    ? (`> ${TIMEOUT_MS.toLocaleString('en-US')}` as const)
    : ms < 10
      ? ms.toFixed(2)
      : ms < 100
        ? ms.toFixed(1)
        : Math.round(ms).toLocaleString('en-US');

/** The times a row finished in, without its timeouts. */
const finishedTimes = (values: readonly (number | null)[]): readonly number[] =>
  Arr.generate(function* () {
    for (const value of values) {
      if (value !== null) {
        yield value;
      }
    }
  });

/** The shortest and longest time of a row, as `0.81–1.64`. */
const msRange = (values: readonly (number | null)[]): string => {
  const finished = finishedTimes(values);

  if (!Arr.isNonEmpty(finished)) {
    throw new Error('a row the page gives the range of timed out everywhere');
  }

  return `${formatMs(Math.min(...finished))}–${formatMs(Math.max(...finished))}` as const;
};

/** The label as a table shows it: synstate-next's rows in bold. */
const rowLabel = (label: string): string =>
  isSubject(label) ? (`**${label}**` as const) : label;

const table = (
  header: readonly string[],
  align: readonly ('l' | 'r')[],
  rows: readonly (readonly string[])[],
): string =>
  [
    `| ${header.join(' | ')} |`,
    `| ${align.map((a) => (a === 'l' ? ':--' : '--:')).join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');

const environmentTable = (
  { environment }: BenchmarkResults,
  t: (typeof texts)[Locale],
): string =>
  table(
    ['', ''],
    ['l', 'l'],
    [
      [
        t.runner,
        environment.runner === 'github-actions'
          ? `GitHub Actions (${environment.runnerImage ?? 'unknown image'})`
          : environment.runner,
      ],
      ['Node.js', environment.node],
      ['OS', environment.os],
      ['CPU', environment.cpu],
      [
        t.libraries,
        Object.entries(environment.libraries)
          .map(([name, version]) => `${name} ${version}`)
          .join(', '),
      ],
      [t.measuredOn, environment.measuredOn],
    ],
  );

/**
 * How many times as long a row takes at M = 200 as at M = 50 (K = 1000); a
 * lower bound when M = 200 timed out.
 */
const deepChainGrowth = (
  analysis: Analysis,
  label: string,
): Readonly<{ ratio: number; timedOut: boolean }> => {
  const shallow = analysis.at('deep-chain', label, 'K=1000, M=50');

  if (shallow === null) {
    throw new Error(
      `${label} timed out in the deep chain at K=1000, M=50, so its growth is unknown; reword the deep chain's "What the results show" on both pages`,
    );
  }

  const deep = analysis.at('deep-chain', label, 'K=1000, M=200');

  return {
    ratio: over(deep ?? TIMEOUT_MS, shallow),
    timedOut: deep === null,
  } as const;
};

const render = (
  results: BenchmarkResults,
  analysis: Analysis,
  locale: Locale,
): ReadonlyRecord<string, markers.Embedded> => {
  const t = texts[locale];

  const block = (text: string): markers.Embedded =>
    ({ text, block: true }) as const;

  const inline = (text: string): markers.Embedded =>
    ({ text, block: false }) as const;

  const subjectWorst = analysis.worst.find(({ library }) => isSubject(library));

  if (subjectWorst === undefined) {
    throw new Error('synstate-next has no worst case');
  }

  // The libraries measured in every scenario but synstate-next: a worst case
  // over one scenario says little.
  const others = analysis.worst.filter(
    ({ library }) =>
      !isSubject(library) &&
      analysis.summaries.every(({ cells }) =>
        cells.some(({ label }) => libraryOf(label) === library),
      ),
  );

  const summary = table(
    [
      t.scenario,
      t.fastest,
      t.subjectOverFastest,
      t.slowest,
      t.slowestOverFastest,
      t.subjectOverPredecessor,
    ],
    ['l', 'l', 'r', 'l', 'r', 'r'],
    analysis.summaries.map((s) => [
      scenarioLink(s.id, locale),
      s.fastest.label,
      formatRatio(over(s.subject.ms, s.fastest.ms), false),
      s.slowest.label,
      formatRatio(over(msOf(s.slowest), s.fastest.ms), s.slowest.ms === null),
      // A timed-out synstate makes the ratio an upper bound.
      `${s.predecessor.ms === null ? '< ' : ''}${formatRatio(over(s.subject.ms, msOf(s.predecessor)), false)}`,
    ]),
  );

  const worst = table(
    [t.library, t.trailsMost, t.fastestThere, t.libraryOverFastest],
    ['l', 'l', 'l', 'r'],
    analysis.worst.map((w) => [
      rowLabel(w.library),
      scenarioLink(w.scenario.id, locale),
      w.scenario.fastest.label,
      formatRatio(w.ratio, w.cell.ms === null),
    ]),
  );

  const scenarioTables = Object.fromEntries(
    scenarios.map(({ id }) => {
      const result = results.scenarios[id];

      if (result === undefined) {
        throw new Error(`no results for ${id}`);
      }

      if (result.kind === 'stats') {
        const subject = result.rows.find(({ label }) => isSubject(label));

        const subjectMedian = median(subject?.times ?? []);

        return [
          `results/${id}`,
          block(
            table(
              [t.library, t.median, t.p95, t.perSecond, t.overSubject],
              ['l', 'r', 'r', 'r', 'r'],
              result.rows.map(({ label, times }) => {
                const sorted = times.toSorted((a, b) => a - b);

                const med = median(sorted);

                return [
                  rowLabel(label),
                  formatMs(med),
                  formatMs(sorted[Math.ceil(sorted.length * 0.95) - 1] ?? 0),
                  Math.round(over(STATS_UPDATES, med) * 1000).toLocaleString(
                    'en-US',
                  ),
                  formatRatio(over(med, subjectMedian), false),
                ];
              }),
            ),
          ),
        ] as const;
      }

      return [
        `results/${id}`,
        block(
          table(
            Arr.toUnshifted(t.library)(result.xLabels.map(t.msHeader)),
            Arr.toUnshifted('l')(result.xLabels.map(() => 'r' as const)),
            result.rows.map(({ label, values }) =>
              Arr.toUnshifted(rowLabel(label))(values.map(formatMs)),
            ),
          ),
        ),
      ] as const;
    }),
  );

  const leastSlowest = Math.min(
    ...analysis.summaries.map((s) => over(msOf(s.slowest), s.fastest.ms)),
  );

  const othersWorstMin = Math.min(...others.map((w) => w.ratio));

  const switchMapRow = analysis.row(
    'conditional-fan-out',
    subjectLabel('switchMap'),
  );

  const fanOut = summaryOf(analysis, 'conditional-fan-out');

  const smallGraphs = smallGraphIds.map((id) => summaryOf(analysis, id));

  const growth = (label: string): string => {
    const { ratio, timedOut } = deepChainGrowth(analysis, label);

    return formatRatio(ratio, timedOut);
  };

  const fanOutPoint = summaryPoints['conditional-fan-out'] ?? '';

  const naiveFanOut = analysis.at(
    'conditional-fan-out',
    subjectLabel('naive derive'),
    fanOutPoint,
  );

  const rxjsCascaded = analysis.row('cascaded-diamond', 'RxJS');

  const rxjsTimeout =
    analysis.points('cascaded-diamond')[rxjsCascaded.indexOf(null)];

  if (rxjsTimeout === undefined) {
    throw new Error(
      'RxJS finished every point of the cascaded diamond; reword its "What the results show" on both pages',
    );
  }

  return {
    environment: block(environmentTable(results, t)),
    summary: block(summary),
    worst: block(worst),
    'subject-worst-over-fastest': inline(
      formatRatio(subjectWorst.ratio, false),
    ),
    'subject-worst-scenario': inline(
      scenarioLink(subjectWorst.scenario.id, locale),
    ),
    'slowest-over-fastest-least': inline(formatRatio(leastSlowest, false)),
    'others-worst-least': inline(formatRatio(othersWorstMin, false)),
    'fan-out-naive-over-fastest': inline(
      formatRatio(
        over(naiveFanOut ?? TIMEOUT_MS, fanOut.fastest.ms),
        naiveFanOut === null,
      ),
    ),
    'fan-out-summary-point': inline(`$${fanOutPoint.replace('=', ' = ')}$`),
    'small-graphs-subject-over-fastest-max': inline(
      formatRatio(
        Math.max(...smallGraphs.map((g) => over(g.subject.ms, g.fastest.ms))),
        false,
      ),
    ),
    'deep-chain-subject-growth': inline(growth(subjectLabel())),
    'deep-chain-rxjs-growth': inline(growth('RxJS')),
    'cascaded-rxjs-timeout': inline(`$${rxjsTimeout.replace('=', ' = ')}$`),
    'unchanged-subject-range': inline(
      msRange(analysis.row('unchanged-value', subjectLabel())),
    ),
    'fan-out-switch-map-range': inline(msRange(switchMapRow)),
    timeout: inline(TIMEOUT_MS.toLocaleString('en-US')),
    rounds: inline(ROUNDS.toString()),
    'stats-runs': inline(STATS_RUNS_PER_ROW.toString()),
    ...scenarioTables,
  };
};

/**
 * Whether a row stays flat: every point finished, and the median of its last
 * three points is within twice the median of its first three, so that one noisy
 * point decides nothing.
 */
const staysFlat = (values: readonly (number | null)[]): boolean => {
  const finished = finishedTimes(values);

  return (
    finished.length === values.length &&
    median(Arr.takeLast(finished, 3)) <= 2 * median(Arr.take(finished, 3))
  );
};

/** Whether a row grows tenfold across its points, or times out on the way. */
const grows = (values: readonly (number | null)[]): boolean => {
  const first = values[0];

  const last = values.at(-1);

  return (
    values.includes(null) ||
    (first !== undefined &&
      first !== null &&
      last !== undefined &&
      last !== null &&
      last >= 10 * first)
  );
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await embedBenchmark();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }
}
