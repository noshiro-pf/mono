import { Arr, Num, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  cascadedDiamond as cascadedDiamondJson,
  conditionalFanOut as conditionalFanOutJson,
  deepChain as deepChainJson,
  derivedChain as derivedChainJson,
  diamond as diamondJson,
  singleState as singleStateJson,
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
 * first times out, up to which branch count SynState beats Jotai), and the
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
 *
 * An entry is language-neutral wherever it can be. The one kind that cannot is
 * a scenario the data picks out — which one a library does worst in — since
 * the cell has to name it in the page's language; such an entry carries one
 * spelling per language, and `embed-benchmark.mts` takes the page's.
 */
export const benchmarkNumbers = (): ReadonlyRecord<string, BenchmarkNumber> =>
  ({
    // Where the numbers on this page were measured. Bare facts rather than a
    // sentence: a marker's value is written once and spliced into both
    // language versions, so it must carry no English of its own.
    'environment/runner': environmentFact((e) =>
      e.runner === 'github-actions'
        ? `GitHub Actions ${e.runnerImage ?? 'standard runner'}`
        : 'local',
    ),
    'environment/os': environmentFact((e) => `${e.platform} (${e.arch})`),
    'environment/cpu': environmentFact((e) => e.cpu),
    'environment/node': environmentFact((e) => e.node),
    'environment/libraries': environmentFact((e) =>
      Object.entries(e.libraries)
        .map(([name, version]) => `${name} ${version}`)
        .join(', '),
    ),
    'environment/measured-on': environmentFact((e) => e.measuredOn),

    // Scenario: Single State — the one scenario every library takes part in,
    // so the one that quotes each of them against SynState.
    'single-state/zustand-over-synstate': factor(
      median(singleState, 'Zustand'),
      median(singleState, 'SynState'),
    ),
    'single-state/valtio-over-synstate': factor(
      median(singleState, 'Valtio'),
      median(singleState, 'SynState'),
    ),
    'single-state/mobx-over-synstate': factor(
      median(singleState, 'MobX'),
      median(singleState, 'SynState'),
    ),
    'single-state/redux-over-synstate': factor(
      median(singleState, 'Redux'),
      median(singleState, 'SynState'),
    ),
    'single-state/jotai-over-synstate': factor(
      median(singleState, 'Jotai'),
      median(singleState, 'SynState'),
    ),
    'single-state/solid-over-synstate': factor(
      median(singleState, 'Solid'),
      median(singleState, 'SynState'),
    ),
    'single-state/preact-signals-over-synstate': factor(
      median(singleState, 'Preact Signals'),
      median(singleState, 'SynState'),
    ),

    // Scenario: Derived Chain / Diamond Dependency
    'derived-chain/updates': count(updates(derivedChain)),
    'derived-chain/jotai-over-synstate': ratio(
      median(derivedChain, 'Jotai'),
      median(derivedChain, 'SynState'),
    ),
    'derived-chain/solid-over-synstate': factor(
      median(derivedChain, 'Solid'),
      median(derivedChain, 'SynState'),
    ),
    'derived-chain/preact-signals-over-synstate': factor(
      median(derivedChain, 'Preact Signals'),
      median(derivedChain, 'SynState'),
    ),
    'diamond/preact-signals-over-synstate': factor(
      median(diamond, 'Preact Signals'),
      median(diamond, 'SynState'),
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
    'deep-chain/redux@k1000-m200': ms(at(deepChain, 'Redux', DEEP_MAX)),
    'deep-chain/redux-over-synstate@k1000-m200': factor(
      at(deepChain, 'Redux', DEEP_MAX),
      at(deepChain, 'SynState', DEEP_MAX),
    ),
    'deep-chain/synstate@k500-m100': ms(at(deepChain, 'SynState', DEEP_MID)),
    'deep-chain/rxjs@k500-m100': ms(at(deepChain, 'RxJS', DEEP_MID)),
    'deep-chain/jotai@k500-m100': ms(at(deepChain, 'Jotai', DEEP_MID)),
    'deep-chain/mobx@k500-m100': ms(at(deepChain, 'MobX', DEEP_MID)),
    'deep-chain/redux@k500-m100': ms(at(deepChain, 'Redux', DEEP_MID)),
    'deep-chain/solid@k1000-m200': ms(at(deepChain, 'Solid', DEEP_MAX)),
    'deep-chain/solid-over-synstate@k1000-m200': factor(
      at(deepChain, 'Solid', DEEP_MAX),
      at(deepChain, 'SynState', DEEP_MAX),
    ),
    'deep-chain/solid@k500-m100': ms(at(deepChain, 'Solid', DEEP_MID)),
    'deep-chain/preact-signals@k1000-m200': ms(
      at(deepChain, 'Preact Signals', DEEP_MAX),
    ),
    'deep-chain/preact-signals-over-synstate@k1000-m200': factor(
      at(deepChain, 'Preact Signals', DEEP_MAX),
      at(deepChain, 'SynState', DEEP_MAX),
    ),
    'deep-chain/preact-signals@k500-m100': ms(
      at(deepChain, 'Preact Signals', DEEP_MID),
    ),

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
    'cascaded-diamond/synstate@min-n': ms(
      at(cascadedDiamond, 'SynState', CASCADED_MIN),
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
    'cascaded-diamond/jotai-over-synstate@max-n': ratio(
      at(cascadedDiamond, 'Jotai', CASCADED_MAX),
      at(cascadedDiamond, 'SynState', CASCADED_MAX),
    ),
    'cascaded-diamond/redux@min-n': ms(
      at(cascadedDiamond, 'Redux', CASCADED_MIN),
    ),
    'cascaded-diamond/redux@max-n': ms(
      at(cascadedDiamond, 'Redux', CASCADED_MAX),
    ),
    'cascaded-diamond/redux-over-synstate@max-n': factor(
      at(cascadedDiamond, 'Redux', CASCADED_MAX),
      at(cascadedDiamond, 'SynState', CASCADED_MAX),
    ),
    'cascaded-diamond/solid@min-n': ms(
      at(cascadedDiamond, 'Solid', CASCADED_MIN),
    ),
    'cascaded-diamond/solid@max-n': ms(
      at(cascadedDiamond, 'Solid', CASCADED_MAX),
    ),
    'cascaded-diamond/preact-signals@min-n': ms(
      at(cascadedDiamond, 'Preact Signals', CASCADED_MIN),
    ),
    'cascaded-diamond/preact-signals@max-n': ms(
      at(cascadedDiamond, 'Preact Signals', CASCADED_MAX),
    ),

    // Scenario: Conditional Fan-Out
    'fan-out/updates-math': `$K = ${count(updates(conditionalFanOut)).replace(',', '{,}')}$`,
    'fan-out/mobx-typical': ms(typical(conditionalFanOut, 'MobX')),
    'fan-out/jotai-typical': ms(typical(conditionalFanOut, 'Jotai')),
    'fan-out/solid-typical': ms(typical(conditionalFanOut, 'Solid')),
    'fan-out/preact-signals-typical': ms(
      typical(conditionalFanOut, 'Preact Signals'),
    ),
    'fan-out/synstate-switch-map-typical': ms(
      typical(conditionalFanOut, 'SynState (switchMap)'),
    ),
    'fan-out/rxjs-switch-map-typical': ms(
      typical(conditionalFanOut, 'RxJS (switchMap)'),
    ),
    'fan-out/synstate@min-b': ms(
      at(conditionalFanOut, 'SynState', FAN_OUT_MIN),
    ),
    'fan-out/synstate-last-measured-b': param(fanOutLastLabel()).toString(),
    'fan-out/synstate@last-measured-b': ms(
      at(conditionalFanOut, 'SynState', fanOutLastLabel()),
    ),
    'fan-out/synstate-ns-per-branch-per-update': nsPerBranchPerUpdate(),
    'fan-out/redux@min-b': ms(at(conditionalFanOut, 'Redux', FAN_OUT_MIN)),
    'fan-out/redux@last-measured-b': ms(
      at(conditionalFanOut, 'Redux', fanOutLastLabel()),
    ),
    'fan-out/jotai-slower-through-b': count(param(fanOutCrossoverLabel())),

    // Summary: the fastest library in each scenario and how far SynState is
    // from it, at the point of the sweep the summary table names. Derived
    // rather than written, because which library leads is exactly what a
    // re-measurement can change.
    'summary/single-state-fastest': fastestRow(singleState),
    'summary/single-state-synstate-over-fastest': factor(
      rowSpread(singleState, 'SynState'),
      1,
    ),
    'summary/single-state-slowest': slowestRow(singleState),
    'summary/single-state-slowest-over-fastest': factor(
      rowSpread(singleState, slowestRow(singleState)),
      1,
    ),
    'summary/derived-chain-fastest': fastestRow(derivedChain),
    'summary/derived-chain-synstate-over-fastest': factor(
      rowSpread(derivedChain, 'SynState'),
      1,
    ),
    'summary/derived-chain-slowest': slowestRow(derivedChain),
    'summary/derived-chain-slowest-over-fastest': factor(
      rowSpread(derivedChain, slowestRow(derivedChain)),
      1,
    ),
    // A diamond is where a library without an ordering step emits glitches,
    // so the summary marks such a fastest row and its footnote names the
    // fastest of the libraries that do not.
    'summary/diamond-fastest': glitchMarked(fastestRow(diamond)),
    'summary/diamond-fastest-glitch-free': fastestRow(
      diamond,
      GLITCHING_LIBRARIES,
    ),
    'summary/diamond-synstate-over-fastest': factor(
      rowSpread(diamond, 'SynState'),
      1,
    ),
    'summary/diamond-slowest': slowestRow(diamond),
    'summary/diamond-slowest-over-fastest': factor(
      rowSpread(diamond, slowestRow(diamond)),
      1,
    ),
    'summary/deep-chain-fastest': fastestAt(deepChain, DEEP_MAX),
    'summary/deep-chain-synstate-over-fastest': factor(
      pointSpread(deepChain, 'SynState', DEEP_MAX),
      1,
    ),
    'summary/deep-chain-slowest': slowestAt(deepChain, DEEP_MAX),
    'summary/deep-chain-slowest-over-fastest': slowestSpreadText(
      deepChain,
      DEEP_MAX,
    ),
    'summary/cascaded-diamond-fastest': fastestAt(
      cascadedDiamond,
      CASCADED_MAX,
    ),
    'summary/cascaded-diamond-synstate-over-fastest': factor(
      pointSpread(cascadedDiamond, 'SynState', CASCADED_MAX),
      1,
    ),
    'summary/cascaded-diamond-slowest': slowestAt(
      cascadedDiamond,
      CASCADED_MAX,
    ),
    'summary/cascaded-diamond-slowest-over-fastest': slowestSpreadText(
      cascadedDiamond,
      CASCADED_MAX,
    ),
    'summary/fan-out-scenario': fanOutSummaryName(),
    'summary/fan-out-fastest': fastestAt(conditionalFanOut, fanOutLastLabel()),
    // SynState written with `switchMap`, the form that follows the selector as
    // MobX and Jotai do; the `combine` form is in the footnote beside it, and
    // is left out of the slowest column for the same reason.
    'summary/fan-out-synstate-over-fastest': factor(
      pointSpread(conditionalFanOut, 'SynState (switchMap)', fanOutLastLabel()),
      1,
    ),
    'summary/fan-out-synstate-combine-over-fastest': factor(
      pointSpread(conditionalFanOut, 'SynState', fanOutLastLabel()),
      1,
    ),
    'summary/fan-out-slowest': slowestAt(
      conditionalFanOut,
      fanOutLastLabel(),
      FAN_OUT_SUMMARY_EXCLUDED,
    ),
    'summary/fan-out-slowest-over-fastest': slowestSpreadText(
      conditionalFanOut,
      fanOutLastLabel(),
      FAN_OUT_SUMMARY_EXCLUDED,
    ),
    // The two figures the sentence under the summary table sets side by side:
    // SynState's worst distance from the fastest across the six rows, and the
    // smallest distance of any scenario's slowest library.
    'summary/synstate-worst-over-fastest': factor(
      Math.max(...summarySynStateSpreads()),
      1,
    ),
    'summary/slowest-over-fastest-least': factor(
      Math.min(...summarySlowestSpreads()),
      1,
    ),

    // The headline on the introduction and the landing page: SynState's worst
    // case (the figure above) beside the range the other libraries' worst
    // cases span, each end named. A library measured in some scenarios only is
    // left out, since its worst case is over those alone.
    ...othersWorstCaseRange(),

    // Summary: for each library, the summary row where it is furthest from
    // that row's fastest library, among the rows that measured it. Which row
    // that is is what a re-measurement can change, so the scenario is derived
    // too; and so is the mark on a library some rows did not measure.
    ...Object.fromEntries(
      summaryLibraries().flatMap((library) => {
        const { scenario } = worstSummaryRow(library);

        // `Preact Signals` → `preact-signals`: a marker key has no spaces.
        const key = library.toLowerCase().replaceAll(' ', '-');

        return [
          [`summary/worst/${key}-library`, partialMarked(library)],
          [`summary/worst/${key}-scenario`, scenario.name],
          [`summary/worst/${key}-fastest`, scenario.fastest()],
          [`summary/worst/${key}-over-fastest`, worstCaseText(library)],
        ] as const;
      }),
    ),

    // Summary: how each library's cost grows when the deep chain gets four
    // times deeper at the same update count — the worst-case growth the page
    // argues from, as one number per library.
    'summary/deep-chain-synstate-growth': factor(
      at(deepChain, 'SynState', DEEP_MAX),
      at(deepChain, 'SynState', DEEP_SHALLOW),
    ),
    'summary/deep-chain-rxjs-growth': factor(
      at(deepChain, 'RxJS', DEEP_MAX),
      at(deepChain, 'RxJS', DEEP_SHALLOW),
    ),
    'summary/deep-chain-jotai-growth': factor(
      at(deepChain, 'Jotai', DEEP_MAX),
      at(deepChain, 'Jotai', DEEP_SHALLOW),
    ),
    'summary/deep-chain-mobx-growth': factor(
      at(deepChain, 'MobX', DEEP_MAX),
      at(deepChain, 'MobX', DEEP_SHALLOW),
    ),
    'summary/deep-chain-redux-growth': factor(
      at(deepChain, 'Redux', DEEP_MAX),
      at(deepChain, 'Redux', DEEP_SHALLOW),
    ),
    'summary/deep-chain-solid-growth': factor(
      at(deepChain, 'Solid', DEEP_MAX),
      at(deepChain, 'Solid', DEEP_SHALLOW),
    ),
    'summary/deep-chain-preact-signals-growth': factor(
      at(deepChain, 'Preact Signals', DEEP_MAX),
      at(deepChain, 'Preact Signals', DEEP_SHALLOW),
    ),
  }) as const;

/**
 * What a marker is replaced with: one string for every page, or one per
 * language where the value is prose (see {@link benchmarkNumbers}).
 */
export type BenchmarkNumber = string | Localized;

type Localized = Readonly<{ en: string; ja: string }>;

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
  platform: string;
  arch: string;
  cpu: string;
  measuredOn: string;
  libraries: ReadonlyRecord<string, string>;
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
 * One state and one subscriber, nothing derived: the only scenario Zustand and
 * Valtio take part in, since their vanilla APIs have no derived-value node and
 * anything else would measure them on a smaller graph than the others.
 */
const singleState: StatsData = singleStateJson;

/**
 * The derived chain. The headline on the introduction and the landing page
 * used to be read from it ("N× faster than Jotai and M× faster than Redux");
 * it now sets worst cases side by side instead, because one scenario chosen
 * for its gap says more about the choice than about the libraries.
 */
const derivedChain: StatsData = derivedChainJson;

/**
 * The diamond, which only the summary quotes: SynState's distance from the
 * fastest library on the one fixed-size graph with a diamond in it.
 */
const diamond: StatsData = diamondJson;

const deepChain: SeriesData = deepChainJson;

const cascadedDiamond: SeriesData = cascadedDiamondJson;

const conditionalFanOut: SeriesData = conditionalFanOutJson;

/**
 * Every committed table, for the environment check: each is a table on the
 * page, so the environment it was measured in has to agree with the others' or
 * the page's one-sentence description of where the numbers come from is false.
 */
const allResults: readonly (StatsData | SeriesData)[] = [
  singleState,
  derivedChain,
  diamond,
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

/** The shallowest chain at the update count of {@link DEEP_MAX}. */
const DEEP_SHALLOW = 'K=1000, M=50';

const CASCADED_MIN = 'N=2';

const CASCADED_MAX = 'N=20';

const FAN_OUT_MIN = 'B=2';

/** Where RxJS first exceeds the timeout, and the last depth it survived. */
const rxjsTimeoutLabel = (): string =>
  firstTimeoutLabel(cascadedDiamond, 'RxJS');

const rxjsLastLabel = (): string => lastMeasuredLabel(cascadedDiamond, 'RxJS');

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

/**
 * A ratio as the summary quotes it: one decimal below 10, where "3.6×" and
 * "4×" say different things, and whole numbers above it, as {@link ratio}.
 */
const factor = (numerator: number, denominator: number): string => {
  const value = divide(numerator, denominator);

  return value < 10 ? value.toFixed(1) : count(Math.round(value));
};

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

/**
 * The library with the smallest median in a single-point scenario, leaving out
 * the libraries named in `excluded`.
 */
const fastestRow = (
  data: StatsData,
  excluded: readonly string[] = [],
): string => {
  const [first] = data.rows
    .filter((r) => !excluded.includes(r.label))
    .toSorted((a, b) => a.median - b.median);

  if (first === undefined) {
    throw new Error('❌ this scenario measured no library');
  }

  return first.label;
};

/**
 * The library that completed `xLabel` fastest. A timeout is never the fastest,
 * for the reason {@link aheadAt} gives.
 */
const fastestAt = (data: SeriesData, xLabel: string): string => {
  const [first] = data.series
    .map((s) => ({ label: s.label, value: valueAt(data, s.label, xLabel) }))
    .filter(
      (r): r is Readonly<{ label: string; value: number }> => r.value !== null,
    )
    .toSorted((a, b) => a.value - b.value);

  if (first === undefined) {
    throw new Error(`❌ no library completed '${xLabel}'`);
  }

  return first.label;
};

/**
 * The library with the largest median in a single-point scenario.
 */
const slowestRow = (data: StatsData): string => {
  const [first] = data.rows.toSorted((a, b) => b.median - a.median);

  if (first === undefined) {
    throw new Error('❌ this scenario measured no library');
  }

  return first.label;
};

/**
 * The library that took longest at `xLabel`, leaving out the rows named in
 * `excluded`. A timeout is slower than any measurement, for the reason
 * {@link aheadAt} gives.
 */
const slowestAt = (
  data: SeriesData,
  xLabel: string,
  excluded: readonly string[] = [],
): string => {
  const [first] = data.series
    .filter((s) => !excluded.includes(s.label))
    .map((s) => ({
      label: s.label,
      value: valueAt(data, s.label, xLabel) ?? Number.POSITIVE_INFINITY,
    }))
    .toSorted((a, b) => b.value - a.value);

  if (first === undefined) {
    throw new Error(`❌ no library was measured at '${xLabel}'`);
  }

  return first.label;
};

/** How many times the fastest library's median `label`'s median is. */
const rowSpread = (data: StatsData, label: string): number =>
  divide(median(data, label), median(data, fastestRow(data)));

/**
 * How many times the fastest library's time `label`'s time at `xLabel` is. A
 * row that timed out counts as the timeout itself, which makes the figure a
 * lower bound; {@link slowestSpreadText} says so where it quotes one.
 */
const pointSpread = (data: SeriesData, label: string, xLabel: string): number =>
  divide(
    valueAt(data, label, xLabel) ?? timeout(data),
    at(data, fastestAt(data, xLabel), xLabel),
  );

/**
 * A distance from the fastest library as the summary quotes it, marked `>`
 * where the row timed out, which makes the figure a lower bound.
 */
const spreadText = (spread: number, timedOut: boolean): string =>
  timedOut
    ? // A no-break space, so that a narrow column does not wrap the mark away
      // from its number.
      (`>\u{A0}${factor(spread, 1)}` as const)
    : factor(spread, 1);

const slowestSpreadText = (
  data: SeriesData,
  xLabel: string,
  excluded: readonly string[] = [],
): string => {
  const slowest = slowestAt(data, xLabel, excluded);

  return spreadText(
    pointSpread(data, slowest, xLabel),
    valueAt(data, slowest, xLabel) === null,
  );
};

/**
 * The fan-out rows the summary leaves out: SynState written with a `combine`
 * over every branch, which the summary replaces with its `switchMap` form.
 */
const FAN_OUT_SUMMARY_EXCLUDED: readonly string[] = ['SynState'] as const;

/** SynState's distance from the fastest in each row of the summary table. */
const summarySynStateSpreads = (): readonly number[] =>
  summaryScenarios().map((s) => s.spread('SynState'));

/**
 * One row of the summary table, as the per-library table reads it: the name
 * the row is linked by, the library that leads it, and where any library
 * stands against that one at the point of the sweep the row names.
 */
type SummaryScenario = Readonly<{
  name: Localized;
  /** The labels of the rows the scenario measured. */
  libraries: readonly string[];
  fastest: () => string;
  spread: (library: string) => number;
  timedOut: (library: string) => boolean;
}>;

/**
 * The summary table's rows, in its order. A name is spelled as that table's
 * first column spells it, the point of the sweep included.
 */
const summaryScenarios = (): readonly SummaryScenario[] =>
  [
    statsScenario(
      {
        en: '[Single state](#scenario-single-state)',
        ja: '[単一ステート](#シナリオ-単一ステート)',
      },
      singleState,
    ),
    statsScenario(
      {
        en: '[Derived chain](#scenario-derived-chain)',
        ja: '[派生チェーン](#シナリオ-派生チェーン)',
      },
      derivedChain,
    ),
    statsScenario(
      {
        en: '[Diamond](#scenario-diamond-dependency)',
        ja: '[ダイヤモンド](#シナリオ-ダイヤモンド依存関係)',
      },
      diamond,
      glitchMarked,
    ),
    seriesScenario(
      {
        en: `[Deep chain](#scenario-deep-chain-throughput) (${DEEP_MAX})`,
        ja: `[ディープチェーン](#シナリオ-ディープチェーンスループット)（${DEEP_MAX}）`,
      },
      deepChain,
      DEEP_MAX,
    ),
    seriesScenario(
      {
        en: `[Cascaded diamond](#scenario-cascaded-diamond) (${CASCADED_MAX})`,
        ja: `[カスケードダイアモンド](#シナリオ-カスケードダイアモンド)（${CASCADED_MAX}）`,
      },
      cascadedDiamond,
      CASCADED_MAX,
    ),
    seriesScenario(
      fanOutSummaryName(),
      conditionalFanOut,
      fanOutLastLabel(),
      FAN_OUT_SUMMARY_FORMS,
    ),
  ] as const;

/**
 * The fan-out row's name. Its point is the last one SynState finished, which a
 * slower machine can move, so the summary table's first column reads it from
 * here too.
 */
const fanOutSummaryName = (): Localized =>
  ({
    en: `[Conditional fan-out](#scenario-conditional-fan-out) (${fanOutLastLabel()})`,
    ja: `[条件付きファンアウト](#シナリオ-条件付きファンアウト)（${fanOutLastLabel()}）`,
  }) as const;

const statsScenario = (
  name: Localized,
  data: StatsData,
  markFastest: (label: string) => string = (label) => label,
): SummaryScenario =>
  ({
    name,
    libraries: data.rows.map((r) => r.label),
    fastest: () => markFastest(fastestRow(data)),
    spread: (library) => rowSpread(data, library),
    timedOut: () => false,
  }) as const;

/**
 * A sweep read at one point. `forms` names, for a library measured in more
 * than one form, the row the summary counts for it.
 */
const seriesScenario = (
  name: Localized,
  data: SeriesData,
  xLabel: string,
  forms: ReadonlyRecord<string, string> = {},
): SummaryScenario => {
  const form = (library: string): string => forms[library] ?? library;

  return {
    name,
    libraries: data.series.map((s) => s.label),
    fastest: () => fastestAt(data, xLabel),
    spread: (library) => pointSpread(data, form(library), xLabel),
    timedOut: (library) => valueAt(data, form(library), xLabel) === null,
  };
};

/**
 * The fan-out row the summary counts for a library measured both ways: the
 * `switchMap` form, which follows the selector as MobX and Jotai do. The
 * summary's own footnote says so for SynState; RxJS is held to the same form so
 * that the per-library table compares the two push-based libraries alike.
 */
const FAN_OUT_SUMMARY_FORMS: ReadonlyRecord<string, string> = {
  SynState: 'SynState (switchMap)',
  RxJS: 'RxJS (switchMap)',
} as const;

/**
 * The rows of the per-library table, in the order the first summary row lists
 * them. That row, the single state, is the one every library takes part in.
 */
const summaryLibraries = (): readonly string[] =>
  summaryScenarios()[0]?.libraries ?? [];

/**
 * The libraries other than SynState that every summary row measured, in the
 * per-library table's order.
 */
const otherEveryScenarioLibraries = (): readonly string[] =>
  summaryLibraries().filter(
    (library) =>
      library !== 'SynState' &&
      summaryScenarios().every((s) => s.libraries.includes(library)),
  );

/**
 * A library name, with the footnote mark the page explains when some summary
 * rows did not measure the library, so that its worst case is over the others
 * only. Language-neutral, like {@link glitchMarked}.
 */
const partialMarked = (library: string): string =>
  summaryScenarios().every((s) => s.libraries.includes(library))
    ? library
    : (`${library} ※3` as const);

/**
 * The summary row where `library` is furthest from that row's fastest, among
 * the rows that measured it.
 */
const worstSummaryRow = (
  library: string,
): Readonly<{ scenario: SummaryScenario; spread: number }> => {
  const [worst] = summaryScenarios()
    .filter((scenario) => scenario.libraries.includes(library))
    .map((scenario) => ({ scenario, spread: scenario.spread(library) }))
    .toSorted((a, b) => b.spread - a.spread);

  if (worst === undefined) {
    throw new Error('❌ the summary has no scenario');
  }

  return worst;
};

/** A library's worst case, from {@link worstSummaryRow}, as the summary quotes it. */
const worstCaseText = (library: string): string => {
  const { scenario, spread } = worstSummaryRow(library);

  return spreadText(spread, scenario.timedOut(library));
};

/**
 * The headline's range of the other libraries' worst cases: of
 * {@link otherEveryScenarioLibraries}, the one whose worst case is nearest the
 * fastest library and the one whose worst case is furthest from it.
 */
const othersWorstCaseRange = (): ReadonlyRecord<string, string> => {
  // A timed-out worst case sorts by its lower bound, which `spreadText`
  // prints with `>`: placing it after every measured one could print an upper
  // end smaller than the lower one.
  const sorted = otherEveryScenarioLibraries()
    .map((library) => {
      const { scenario, spread } = worstSummaryRow(library);

      return {
        library,
        spread,
        text: spreadText(spread, scenario.timedOut(library)),
      };
    })
    .toSorted((a, b) => a.spread - b.spread);

  const least = sorted[0];

  const most = sorted.at(-1);

  if (least === undefined || most === undefined || least === most) {
    throw new Error(
      '❌ the headline range needs two other libraries that took part in every scenario',
    );
  }

  return {
    'summary/others-least-worst-library': least.library,
    'summary/others-least-worst-over-fastest': least.text,
    'summary/others-most-worst-library': most.library,
    'summary/others-most-worst-over-fastest': most.text,
  };
};

/** The slowest library's distance from the fastest in each summary row. */
const summarySlowestSpreads = (): readonly number[] =>
  [
    rowSpread(singleState, slowestRow(singleState)),
    rowSpread(derivedChain, slowestRow(derivedChain)),
    rowSpread(diamond, slowestRow(diamond)),
    pointSpread(deepChain, slowestAt(deepChain, DEEP_MAX), DEEP_MAX),
    pointSpread(
      cascadedDiamond,
      slowestAt(cascadedDiamond, CASCADED_MAX),
      CASCADED_MAX,
    ),
    pointSpread(
      conditionalFanOut,
      slowestAt(conditionalFanOut, fanOutLastLabel(), FAN_OUT_SUMMARY_EXCLUDED),
      fanOutLastLabel(),
    ),
  ] as const;

/** The libraries whose subscribers see intermediate values in a diamond. */
const GLITCHING_LIBRARIES: readonly string[] = ['RxJS'] as const;

/**
 * A library name, with the footnote mark the summary table explains when the
 * library is one that glitches. Language-neutral, so one value serves both
 * pages.
 */
const glitchMarked = (label: string): string =>
  GLITCHING_LIBRARIES.includes(label) ? (`${label} ※1` as const) : label;

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
