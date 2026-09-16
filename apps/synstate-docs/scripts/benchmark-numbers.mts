import { Num, Result } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
/* eslint-disable import-x/no-relative-packages */
import cascadedDiamondJson from '../../../libs/synstate/samples/docs-site/benchmark/results-cascaded-diamond.json' with { type: 'json' };
import conditionalFanOutJson from '../../../libs/synstate/samples/docs-site/benchmark/results-conditional-fan-out.json' with { type: 'json' };
import deepChainJson from '../../../libs/synstate/samples/docs-site/benchmark/results-deep-chain.json' with { type: 'json' };
import derivedChainJson from '../../../libs/synstate/samples/docs-site/benchmark/results.json' with { type: 'json' };
/* eslint-enable import-x/no-relative-packages */

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
    // Scenario: Derived Chain / Diamond Dependency
    'derived-chain/updates': count(updates(derivedChain)),
    'derived-chain/jotai-over-synstate': ratio(
      median(derivedChain, 'Jotai'),
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
    'fan-out/synstate@max-b': ms(
      at(conditionalFanOut, 'SynState', FAN_OUT_MAX),
    ),
    'fan-out/synstate-ns-per-branch-per-update': nsPerBranchPerUpdate(),
    'fan-out/jotai-slower-through-b': count(param(fanOutCrossoverLabel())),
  }) as const;

/** One library's row in a sweep, and the constants the sweep ran under. */
type SeriesData = Readonly<{
  meta: Readonly<{ updates: number | null; timeoutMs: number | null }>;
  xLabels: readonly string[];
  series: readonly Readonly<{
    label: string;
    values: readonly (number | null)[];
  }>[];
}>;

type StatsData = Readonly<{
  meta: Readonly<{ updates: number | null; timeoutMs: number | null }>;
  rows: readonly Readonly<{ label: string; median: number }>[];
}>;

const derivedChain: StatsData = derivedChainJson;

const deepChain: SeriesData = deepChainJson;

const cascadedDiamond: SeriesData = cascadedDiamondJson;

const conditionalFanOut: SeriesData = conditionalFanOutJson;

/** The sweep points the prose singles out by name. */
const DEEP_MAX = 'K=1000, M=200';

const DEEP_MID = 'K=500, M=100';

const CASCADED_MIN = 'N=2';

const CASCADED_MAX = 'N=20';

const FAN_OUT_MIN = 'B=2';

const FAN_OUT_MAX = 'B=1000';

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

const at = (data: SeriesData, label: string, xLabel: string): number => {
  const index = data.xLabels.indexOf(xLabel);

  if (index === -1) {
    throw new Error(`❌ '${xLabel}' is not one of the measured points`);
  }

  const value = row(data, label).values[index];

  if (value === undefined || value === null) {
    throw new Error(`❌ ${label} has no measurement at '${xLabel}'`);
  }

  return value;
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
 * makes "linear in B" concrete: the largest branch count's cost spread over
 * its branches and over the updates the runner drove.
 */
const nsPerBranchPerUpdate = (): string =>
  count(
    Math.round(
      divide(
        at(conditionalFanOut, 'SynState', FAN_OUT_MAX) * NS_PER_MS,
        param(FAN_OUT_MAX) * updates(conditionalFanOut),
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
    rivals.every((r) => {
      const rival = r.values[i];

      return (
        rival === undefined || rival === null || at(data, label, point) < rival
      );
    }),
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
      .every((x) => at(data, label, x) < at(data, rival, x)),
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
