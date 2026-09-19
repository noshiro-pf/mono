import { Arr, Num, Result } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import {
  cascadedDiamond as cascadedDiamondJson,
  conditionalFanOut as conditionalFanOutJson,
  deepChain as deepChainJson,
  derivedChain as derivedChainJson,
  diamond as diamondJson,
} from '../src/data/index.mjs';

/**
 * Every number the benchmark prose quotes, keyed by what it stands for.
 *
 * The tables beside this prose have been generated since they were written;
 * the sentences around them were not, so a re-measurement updated the table
 * and left the paragraph under it describing the previous run. That is how the
 * cascaded diamond section came to say Jotai grows faster than $O(N)$ while
 * the table above it showed a flat row.
 *
 * What is keyed here is a number the measurements decide: a value read off a
 * row, a ratio between two of them, an index the data picks out (where RxJS
 * first times out, from which depth Jotai overtakes SynState), and the
 * constants the runners drove the scenarios with. A parameter value that
 * merely names a point the prose chose to talk about — "$K=1000$, $M=200$" —
 * is part of the sentence and stays written in it.
 *
 * `embed-benchmark.mts` writes these into the `{/* bench:<key> *\/}` markers in
 * both language versions of `benchmark.mdx`, so one entry keeps the English
 * and the Japanese page saying the same thing. A key that no marker uses, and
 * a marker naming a key that is not here, are both errors — see that file.
 *
 * A few entries carry a whole `$…$` expression rather than a bare number.
 * KaTeX takes what is between the dollars literally, so a marker cannot sit
 * inside one: the comment would render as italic letters. Where the number is
 * inside math, the marker wraps the math.
 *
 * A marker cannot go in a heading either. Starlight derives the anchor from
 * the heading's raw text, so the marker's own key is spelled into the `id` —
 * measured, and the anchor it produced was neither readable nor stable. The
 * heading that quoted a ratio says "Why Jotai Is Slower" instead, and the
 * number it used to carry is in the paragraph below it, where a marker works.
 */
export const benchmarkNumbers = (): ReadonlyRecord<string, string> =>
  ({
    // Where the numbers on this page were measured. Three bare facts rather
    // than a sentence: a marker's value is written once and spliced into both
    // language versions, so it must carry no English of its own.
    'environment/runner': environmentFact((e) =>
      e.runner === 'github-actions'
        ? `GitHub Actions ${e.runnerImage ?? 'standard runner'}`
        : e.cpu,
    ),
    'environment/node': environmentFact((e) => e.node),
    'environment/measured-on': environmentFact((e) => e.measuredOn),

    // Scenario: Derived Chain / Diamond Dependency
    //
    // The first two are also the headline figures on the introduction and the
    // landing page — see the note on the derived chain below.
    'derived-chain/updates': count(updates(derivedChain)),
    'derived-chain/jotai-over-synstate': ratio(
      median(derivedChain, 'Jotai'),
      median(derivedChain, 'SynState'),
    ),
    'derived-chain/redux-over-synstate': ratio(
      median(derivedChain, 'Redux'),
      median(derivedChain, 'SynState'),
    ),

    // Scenario: Deep Chain Throughput
    'deep-chain/timeout': ms(timeout(deepChain)),
    'deep-chain/synstate@k1000-m200': ms(at(deepChain, 'SynState', DEEP_MAX)),
    'deep-chain/rxjs@k1000-m200': ms(at(deepChain, 'RxJS', DEEP_MAX)),
    'deep-chain/jotai@k1000-m200': ms(at(deepChain, 'Jotai', DEEP_MAX)),
    'deep-chain/mobx@k1000-m200': ms(at(deepChain, 'MobX', DEEP_MAX)),
    'deep-chain/rxjs-over-synstate@k1000-m200': ratio(
      at(deepChain, 'RxJS', DEEP_MAX),
      at(deepChain, 'SynState', DEEP_MAX),
    ),
    'deep-chain/jotai-over-synstate@k1000-m200': ratio(
      at(deepChain, 'Jotai', DEEP_MAX),
      at(deepChain, 'SynState', DEEP_MAX),
    ),
    'deep-chain/mobx-over-synstate@k1000-m200': ratio(
      at(deepChain, 'MobX', DEEP_MAX),
      at(deepChain, 'SynState', DEEP_MAX),
    ),
    'deep-chain/synstate@k500-m100': ms(at(deepChain, 'SynState', DEEP_MID)),
    'deep-chain/rxjs@k500-m100': ms(at(deepChain, 'RxJS', DEEP_MID)),
    'deep-chain/jotai@k500-m100': ms(at(deepChain, 'Jotai', DEEP_MID)),
    'deep-chain/mobx@k500-m100': ms(at(deepChain, 'MobX', DEEP_MID)),

    // Scenario: Cascaded Diamond
    'cascaded-diamond/timeout': ms(timeout(cascadedDiamond)),
    'cascaded-diamond/updates-math': String.raw`$\times ${count(updates(cascadedDiamond))}$`,
    'cascaded-diamond/rxjs-timeout-n-math': `$N=${param(rxjsTimeoutLabel())}$`,
    'cascaded-diamond/rxjs-timeout-emissions-math': `$2^{${param(rxjsTimeoutLabel())}} = ${(2 ** param(rxjsTimeoutLabel())).toString()}$`,
    'cascaded-diamond/rxjs-last-measured-n-math': `$N=${param(rxjsLastLabel())}$`,
    'cascaded-diamond/rxjs@last-measured': ms(
      at(cascadedDiamond, 'RxJS', rxjsLastLabel()),
    ),
    'cascaded-diamond/rxjs-over-synstate@last-measured': ratio(
      at(cascadedDiamond, 'RxJS', rxjsLastLabel()),
      at(cascadedDiamond, 'SynState', rxjsLastLabel()),
    ),
    'cascaded-diamond/synstate@rxjs-last-measured': ms(
      at(cascadedDiamond, 'SynState', rxjsLastLabel()),
    ),
    'cascaded-diamond/mobx@max-n': ms(
      at(cascadedDiamond, 'MobX', CASCADED_MAX),
    ),
    'cascaded-diamond/synstate@max-n': ms(
      at(cascadedDiamond, 'SynState', CASCADED_MAX),
    ),
    'cascaded-diamond/jotai@min-n': ms(
      at(cascadedDiamond, 'Jotai', CASCADED_MIN),
    ),
    'cascaded-diamond/jotai@max-n': ms(
      at(cascadedDiamond, 'Jotai', CASCADED_MAX),
    ),
    'cascaded-diamond/jotai-lead-from-n-math': `$N=${param(jotaiLeadLabel())}$`,
    'cascaded-diamond/synstate-over-jotai@max-n': ratio(
      at(cascadedDiamond, 'SynState', CASCADED_MAX),
      at(cascadedDiamond, 'Jotai', CASCADED_MAX),
    ),

    // Scenario: Conditional Fan-Out
    'fan-out/updates-math': `$K = ${count(updates(conditionalFanOut)).replace(',', '{,}')}$`,
    'fan-out/mobx-typical': ms(typical(conditionalFanOut, 'MobX')),
    'fan-out/jotai-typical': ms(typical(conditionalFanOut, 'Jotai')),
    'fan-out/synstate@min-b': ms(
      at(conditionalFanOut, 'SynState', FAN_OUT_MIN),
    ),
    'fan-out/synstate-last-measured-b': param(fanOutLastLabel()).toString(),
    'fan-out/synstate@last-measured-b': ms(
      at(conditionalFanOut, 'SynState', fanOutLastLabel()),
    ),
    'fan-out/synstate-ns-per-branch-per-update': nsPerBranchPerUpdate(),
    'fan-out/jotai-slower-through-b': count(param(fanOutCrossoverLabel())),
  }) as const;

/** One library's row in a sweep, and the constants the sweep ran under. */
/**
 * The environment a results file records, as this module needs to read it.
 *
 * Optional because the tables committed before the measurement moved to CI do
 * not carry one — see {@link environmentFact}, which writes an em dash rather
 * than inventing a machine.
 */
type RecordedEnvironment = Readonly<{
  runner: string;
  runnerImage: string | null;
  node: string;
  cpu: string;
  measuredOn: string;
}>;

type ResultsMeta = Readonly<{
  updates: number | null;
  timeoutMs: number | null;
  environment?: RecordedEnvironment;
}>;

type SeriesData = Readonly<{
  meta: ResultsMeta;
  xLabels: readonly string[];
  series: readonly Readonly<{
    label: string;
    values: readonly (number | null)[];
  }>[];
}>;

type StatsData = Readonly<{
  meta: ResultsMeta;
  rows: readonly Readonly<{ label: string; median: number }>[];
}>;

/**
 * The derived chain, which is also where the headline "up to N× faster than
 * Jotai and M× faster than Redux" is read from.
 *
 * It is the one scenario that carries both libraries and the simplest graph
 * either of them can be asked for, so both halves of that sentence come from
 * one measurement. Reading each half from whichever of the two single-point
 * scenarios flatters it most — which is how the pages came to say 30× and 16×,
 * the first from the derived chain and the second from the diamond — turned
 * out to be a choice noise makes: Redux's diamond median held at ~317 ms
 * across the two runs while SynState's doubled with the machine, and that
 * alone moved the wider scenario from one to the other.
 */
const derivedChain: StatsData = derivedChainJson;

const deepChain: SeriesData = deepChainJson;

const cascadedDiamond: SeriesData = cascadedDiamondJson;

const conditionalFanOut: SeriesData = conditionalFanOutJson;

/**
 * Every committed table, for the environment check alone.
 *
 * The diamond is here and nowhere else in this module: no sentence quotes a
 * number from it any more, but it is a table on the page, so the environment
 * it was measured in has to agree with the others' or the page's one-sentence
 * description of where the numbers come from is false.
 */
const allResults: readonly (StatsData | SeriesData)[] = [
  derivedChain,
  diamondJson,
  deepChain,
  cascadedDiamond,
  conditionalFanOut,
] as const;

/**
 * One fact about where every table on the page was measured.
 *
 * Derived rather than written, for the reason the rest of this module exists:
 * the environment is as much a part of a millisecond as the digits are, and a
 * page describing one machine while its tables came from another is how this
 * repository spent a day telling a code regression apart from a change of
 * machine.
 *
 * The scenarios must agree, the date included — `benchmark` measures all of
 * them in one pass, and re-measuring one alone (`benchmark:deep-chain`) is
 * useful on one machine and misleading across two, so a disagreement fails
 * here rather than being averaged into a claim. An em dash where nothing was
 * recorded: those tables predate the pinned runner, and inventing a machine
 * for them would be worse than saying so.
 */
const environmentFact = (
  read: (environment: RecordedEnvironment) => string,
): string => {
  const recorded = allResults
    .map((r) => r.meta.environment)
    .filter((e) => e !== undefined);

  if (recorded.length < allResults.length) {
    return '\u{2014}';
  }

  const distinct = Arr.uniq(recorded.map(read));

  const [only] = distinct;

  if (only === undefined || distinct.length > 1) {
    throw new Error(
      [
        'The scenarios disagree about where they were measured, so no single',
        'value describes the page:',
        ...distinct.map((d) => `  - ${d}`),
        '',
        'Re-measure every scenario with',
        '`pnpm --filter @synstate/docs run benchmark`.',
      ].join('\n'),
    );
  }

  return only;
};

/** The sweep points the prose singles out by name. */
const DEEP_MAX = 'K=1000, M=200';

const DEEP_MID = 'K=500, M=100';

const CASCADED_MIN = 'N=2';

const CASCADED_MAX = 'N=20';

const FAN_OUT_MIN = 'B=2';

/** Where RxJS first exceeds the timeout, and the last depth it survived. */
const rxjsTimeoutLabel = (): string =>
  firstTimeoutLabel(cascadedDiamond, 'RxJS');

const rxjsLastLabel = (): string => lastMeasuredLabel(cascadedDiamond, 'RxJS');

/**
 * The depth from which Jotai is the fastest library but MobX, and stays so for
 * every deeper point. Anything less would let a single crossing that the next
 * depth undoes be reported as a trend.
 */
const jotaiLeadLabel = (): string =>
  leadFromLabel(cascadedDiamond, 'Jotai', ['MobX']);

/**
 * The largest branch count SynState was measured at.
 *
 * Not the sweep's largest, which is what the prose used to name: SynState's
 * fan-out row is the one that grows with $B$, so it is the row the timeout
 * catches first, and on a machine slower than the one the committed tables
 * came from the last point is a timeout rather than a measurement. Read off
 * the data — as {@link rxjsLastLabel} is for the same reason — the sentence
 * quotes the largest branch count that was actually measured, and names it.
 */
const fanOutLastLabel = (): string =>
  lastMeasuredLabel(conditionalFanOut, 'SynState');

/** The largest branch count at which SynState still beats Jotai. */
const fanOutCrossoverLabel = (): string =>
  lastAheadLabel(conditionalFanOut, 'SynState', 'Jotai');

/**
 * Renders a measurement the way the prose quotes one: a tenth of a millisecond
 * below 100 ms, and whole milliseconds above it, where the tenth is noise.
 */
const ms = (value: number): string =>
  value < 100
    ? (`${value.toFixed(1)} ms` as const)
    : (`${count(Math.round(value))} ms` as const);

const ratio = (numerator: number, denominator: number): string =>
  count(Math.round(divide(numerator, denominator)));

/** Digits in groups of three, as every number in the prose is written. */
const count = (value: number): string => {
  const digits = Math.round(value).toString();

  const mut_groups: string[] = [];

  let mut_rest = digits;

  while (mut_rest.length > 3) {
    mut_groups.unshift(mut_rest.slice(-3));

    mut_rest = mut_rest.slice(0, -3);
  }

  mut_groups.unshift(mut_rest);

  return mut_groups.join(',');
};

/** The number in a column heading: `'N=16'` → `16`, `'B=1000'` → `1000`. */
const param = (xLabel: string): number => {
  const parsed = Num.safeParseInt(xLabel.split('=', 2)[1] ?? '');

  if (Result.isErr(parsed)) {
    throw new Error(`❌ no parameter value in the column heading '${xLabel}'`);
  }

  return parsed.value;
};

/**
 * What the row holds at one point of the sweep: the measurement, or `null`
 * where the runner gave up on it. A timeout is a result the prose reads —
 * which library stopped completing, and from where — so the comparisons below
 * ask for the nullable value and decide what it means, and only {@link at},
 * for a number a sentence quotes outright, insists on one.
 */
const valueAt = (
  data: SeriesData,
  label: string,
  xLabel: string,
): number | null => {
  const index = data.xLabels.indexOf(xLabel);

  if (index === -1) {
    throw new Error(`❌ '${xLabel}' is not one of the measured points`);
  }

  return row(data, label).values[index] ?? null;
};

const at = (data: SeriesData, label: string, xLabel: string): number => {
  const value = valueAt(data, label, xLabel);

  if (value === null) {
    throw new Error(`❌ ${label} has no measurement at '${xLabel}'`);
  }

  return value;
};

/**
 * Whether `label` completed the point faster than `rival` did. A point one of
 * them did not complete is decided by the one that did: the row that timed out
 * is the slower of the two, which is exactly what the timeout established.
 */
const aheadAt = (
  data: SeriesData,
  label: string,
  rival: number | null,
  xLabel: string,
): boolean => {
  const mine = valueAt(data, label, xLabel);

  return mine !== null && (rival === null || mine < rival);
};

const median = (data: StatsData, label: string): number => {
  const found = data.rows.find((r) => r.label === label);

  if (found === undefined) {
    throw new Error(`❌ '${label}' is not one of the measured libraries`);
  }

  return found.median;
};

/**
 * The library's typical cost across the sweep, for a row the prose calls
 * constant. The median rather than the mean, so that one slow first point —
 * the branch counts are measured in one process, warmest last — does not move
 * the figure the sentence quotes as "regardless of B".
 */
const typical = (data: SeriesData, label: string): number => {
  const measured = row(data, label)
    .values.filter((v) => v !== null)
    .toSorted((a, b) => a - b);

  const value = measured[Math.floor(divide(measured.length, 2))];

  if (value === undefined) {
    throw new Error(`❌ ${label} has no measurements at all`);
  }

  return value;
};

/**
 * The slope of SynState's fan-out row in nanoseconds, which is the figure that
 * makes "linear in B" concrete: the largest measured branch count's cost
 * spread over its branches and over the updates the runner drove.
 */
const nsPerBranchPerUpdate = (): string =>
  count(
    Math.round(
      divide(
        at(conditionalFanOut, 'SynState', fanOutLastLabel()) * NS_PER_MS,
        param(fanOutLastLabel()) * updates(conditionalFanOut),
      ),
    ),
  );

const firstTimeoutLabel = (data: SeriesData, label: string): string => {
  const index = row(data, label).values.indexOf(null);

  const xLabel = index === -1 ? undefined : data.xLabels[index];

  if (xLabel === undefined) {
    throw new Error(`❌ ${label} never times out — the prose says it does`);
  }

  return xLabel;
};

const lastMeasuredLabel = (data: SeriesData, label: string): string => {
  const values = row(data, label).values;

  const index = values.findLastIndex((v) => v !== null);

  const xLabel = index === -1 ? undefined : data.xLabels[index];

  if (xLabel === undefined) {
    throw new Error(`❌ ${label} has no measurement that completed`);
  }

  return xLabel;
};

const leadFromLabel = (
  data: SeriesData,
  label: string,
  ignored: readonly string[],
): string => {
  const rivals = data.series.filter(
    (s) => s.label !== label && !ignored.includes(s.label),
  );

  const ahead = data.xLabels.map((point, i) =>
    rivals.every((r) => aheadAt(data, label, r.values[i] ?? null, point)),
  );

  const index = ahead.findIndex((_, i) => ahead.slice(i).every((a) => a));

  const xLabel = index === -1 ? undefined : data.xLabels[index];

  if (xLabel === undefined) {
    throw new Error(`❌ ${label} never takes and keeps the lead`);
  }

  return xLabel;
};

const lastAheadLabel = (
  data: SeriesData,
  label: string,
  rival: string,
): string => {
  const index = data.xLabels.findLastIndex((_xLabel, i) =>
    data.xLabels
      .slice(0, i + 1)
      .every((x) => aheadAt(data, label, valueAt(data, rival, x), x)),
  );

  const xLabel = index === -1 ? undefined : data.xLabels[index];

  if (xLabel === undefined) {
    throw new Error(`❌ ${label} is never ahead of ${rival}`);
  }

  return xLabel;
};

const row = (
  data: SeriesData,
  label: string,
): Readonly<{ label: string; values: readonly (number | null)[] }> => {
  const found = data.series.find((s) => s.label === label);

  if (found === undefined) {
    throw new Error(`❌ '${label}' is not one of the measured libraries`);
  }

  return found;
};

const updates = (data: SeriesData | StatsData): number => {
  const value = data.meta.updates;

  if (value === null) {
    throw new Error('❌ this scenario varies its update count per point');
  }

  return value;
};

const timeout = (data: SeriesData): number => {
  const value = data.meta.timeoutMs;

  if (value === null) {
    throw new Error('❌ this scenario has no timeout');
  }

  return value;
};

const divide = (numerator: number, denominator: number): number => {
  if (!Num.isNonZero(denominator)) {
    throw new Error('❌ cannot divide by zero');
  }

  return Num.div(numerator, denominator);
};

const NS_PER_MS = 1_000_000;
