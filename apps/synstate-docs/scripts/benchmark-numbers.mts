import { Arr, Num, Result } from 'ts-data-forge';
import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
import {
  cascadedDiamond as cascadedDiamondJson,
  conditionalFanOut as conditionalFanOutJson,
  deepChain as deepChainJson,
  derivedChain as derivedChainJson,
  diamond as diamondJson,
  isNaiveForm,
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
 *
 * The per-library table's ratio cells carry their own markup, the `×` and the
 * emphasis the page explains under the table, so they are cells rather than
 * numbers: prose quoting one of those figures has a plain key of its own.
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
    'derived-chain/rxjs-over-synstate': factor(
      median(derivedChain, 'RxJS'),
      median(derivedChain, 'SynState'),
    ),
    'diamond/rxjs-over-synstate': factor(
      median(diamond, 'RxJS'),
      median(diamond, 'SynState'),
    ),

    // The comparative words around the small-graph figures (see
    // `compared`): which side of SynState a library falls on is what a
    // re-measurement moves, so the word is derived with the number.
    'compare/derived-chain/rxjs-speed': compared(
      'RxJS against SynState in the derived chain',
      [medians(derivedChain, 'RxJS', 'SynState')],
      SPEED,
    ),
    'compare/diamond/rxjs-speed': compared(
      'RxJS against SynState in the diamond',
      [medians(diamond, 'RxJS', 'SynState')],
      SPEED,
    ),
    'compare/derived-chain/preact-signals-speed': compared(
      'Preact Signals against SynState in the derived chain',
      [medians(derivedChain, 'Preact Signals', 'SynState')],
      SPEED,
    ),
    'compare/derived-graphs/preact-signals-speed': compared(
      'Preact Signals against SynState in the derived chain and the diamond',
      [
        medians(derivedChain, 'Preact Signals', 'SynState'),
        medians(diamond, 'Preact Signals', 'SynState'),
      ],
      SPEED,
    ),
    'compare/derived-graphs/heavy-speed': compared(
      'Solid, MobX, Jotai and Redux against SynState in the derived chain and the diamond',
      [derivedChain, diamond].flatMap((data) =>
        HEAVY_LIBRARIES.map((library) => medians(data, library, 'SynState')),
      ),
      SPEED_PLURAL,
    ),
    'compare/diamond/rxjs-pass-cost': compared(
      "RxJS's two passes against SynState's one in the diamond",
      [medians(diamond, 'RxJS', 'SynState')],
      PASS_COST,
    ),
    'compare/small-graphs/preact-signals-overhead': compared(
      'Preact Signals against SynState in the single state, the derived chain and the diamond',
      SMALL_GRAPHS.map((data) => medians(data, 'Preact Signals', 'SynState')),
      OVERHEAD_AT_MOST,
    ),
    'compare/small-graphs/synstate-vs-heavy-overhead': compared(
      'SynState against Solid, MobX, Jotai and Redux in the single state, the derived chain and the diamond',
      SMALL_GRAPHS.flatMap((data) =>
        HEAVY_LIBRARIES.map((library) => medians(data, 'SynState', library)),
      ),
      OVERHEAD,
    ),
    'compare/small-graphs/synstate-vs-preact-signals-overhead': compared(
      'SynState against Preact Signals in the single state, the derived chain and the diamond',
      SMALL_GRAPHS.map((data) => medians(data, 'SynState', 'Preact Signals')),
      OVERHEAD,
    ),
    'compare/single-state/synstate-vs-zustand-overhead': compared(
      'SynState against Zustand in the single state',
      [medians(singleState, 'SynState', 'Zustand')],
      OVERHEAD,
    ),
    'compare/small-graphs/synstate-vs-rxjs-overhead': compared(
      'SynState against RxJS in the single state, the derived chain and the diamond',
      SMALL_GRAPHS.map((data) => medians(data, 'SynState', 'RxJS')),
      OVERHEAD,
    ),
    'compare/preact-signals-winner': compared(
      'Preact Signals against SynState in the single state, the deep chain (K=1000, M=200) and the diamond',
      [
        medians(singleState, 'Preact Signals', 'SynState'),
        [
          at(deepChain, 'Preact Signals', DEEP_MAX),
          at(deepChain, 'SynState', DEEP_MAX),
        ],
        medians(diamond, 'Preact Signals', 'SynState'),
      ],
      WINNER,
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
    'compare/deep-chain/redux-factor': compared(
      'Redux against SynState at every point of the deep chain',
      everyPoint(deepChain, 'Redux', 'SynState'),
      SMALL_FACTOR,
    ),
    'compare/deep-chain/redux-factor-either-way': compared(
      'Redux against SynState on both sides at the points of the deep chain',
      everyPoint(deepChain, 'Redux', 'SynState'),
      SMALL_FACTOR_EITHER_WAY,
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
    'cascaded-diamond/mobx-over-synstate-typical': typicalFactor(
      'MobX against SynState in the cascaded diamond',
      everyPoint(cascadedDiamond, 'MobX', 'SynState'),
    ),
    // Whether a row stays flat across the sweep (see `rowTrend`).
    'compare/cascaded-diamond/synstate-growth': rowTrend(
      "SynState's cascaded diamond row",
      cascadedDiamond,
      'SynState',
      [CASCADED_MIN, CASCADED_MAX],
      'flat',
    ),
    'compare/cascaded-diamond/jotai-growth': rowTrend(
      "Jotai's cascaded diamond row",
      cascadedDiamond,
      'Jotai',
      [CASCADED_MIN, CASCADED_MAX],
      'grows',
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
    'fan-out/synstate-naive@min-b': ms(
      at(conditionalFanOut, SYNSTATE_NAIVE, FAN_OUT_MIN),
    ),
    'fan-out/last-measured-b': param(fanOutLastLabel()).toString(),
    'fan-out/synstate-naive@last-measured-b': ms(
      at(conditionalFanOut, SYNSTATE_NAIVE, fanOutLastLabel()),
    ),
    'fan-out/synstate-naive-ns-per-branch-per-update': nsPerBranchPerUpdate(),
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
    // MobX and Jotai do; the naive `derive` form is in the footnote beside it,
    // and the naive forms are left out of the slowest column for the same
    // reason.
    'summary/fan-out-synstate-over-fastest': factor(
      pointSpread(
        conditionalFanOut,
        FAN_OUT_SUMMARY_FORMS['SynState'] ?? 'SynState',
        fanOutLastLabel(),
      ),
      1,
    ),
    'summary/fan-out-synstate-naive-over-fastest': factor(
      pointSpread(conditionalFanOut, SYNSTATE_NAIVE, fanOutLastLabel()),
      1,
    ),
    'summary/fan-out-slowest': slowestAt(
      conditionalFanOut,
      fanOutLastLabel(),
      fanOutSummaryExcluded(),
    ),
    'summary/fan-out-slowest-over-fastest': slowestSpreadText(
      conditionalFanOut,
      fanOutLastLabel(),
      fanOutSummaryExcluded(),
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
    // The figure the paragraph on Preact Signals sets beside SynState's. The
    // per-library table's cell carries markup, so the prose has its own key.
    'summary/preact-signals-worst-over-fastest':
      worstCaseText('Preact Signals'),
    // Clauses that name or explain a library's worst row as a scenario the
    // prose then describes, and so hold only while the data pick it.
    'summary/rxjs-worst-label': whileWorstIn('RxJS', CASCADED_DIAMOND, {
      en: "RxJS's worst row",
      ja: 'RxJS の最悪の行である',
    }),
    'summary/mobx-worst-label': whileWorstIn('MobX', DEEP_CHAIN, {
      en: "MobX's worst row",
      ja: 'MobX の最悪の行である',
    }),
    'summary/redux-worst-label': whileWorstIn('Redux', FAN_OUT, {
      en: "Redux's worst row",
      ja: 'Redux の最悪の行である',
    }),
    'summary/synstate-worst-explained': whileWorstIn('SynState', FAN_OUT, {
      en: "that is already the `switchMap` form, which holds no branch nobody reads: what remains is SynState's cost of a write that reaches no node",
      ja: 'これはすでに誰も読まない分岐を持たない `switchMap` の形での数字です。残っているのは、どのノードにも届かない書き込みの SynState でのコストです',
    }),
    'summary/jotai-worst-explained': whileWorstIn('Jotai', FAN_OUT, {
      en: 'where a write to a branch nobody reads costs MobX, Solid and Preact Signals almost nothing and Jotai a whole `store.set()`',
      ja: '誰も読まない分岐への書き込みは MobX・Solid・Preact Signals にはほとんど何のコストもかかりませんが、Jotai には `store.set()` 1回分がまるごとかかります',
    }),

    // Summary: for each library, the summary row where it is furthest from
    // that row's fastest library, among the rows that measured it. Which row
    // that is is what a re-measurement can change, so the scenario is derived
    // too; and so is the mark on a library some rows did not measure.
    ...worstCaseRows(),

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
 * used to be read from it ("N× faster than Jotai and M× faster than Redux"),
 * and later set worst cases side by side; it now quotes no number, because
 * one ratio chosen for its gap says more about the choice than about the
 * libraries, and the benchmark page sets every scenario out.
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

/**
 * SynState's fan-out row written naively, with a `derive` over every branch:
 * the row that grows with $B$, which the fan-out prose quotes as such.
 */
const SYNSTATE_NAIVE = 'SynState (naive derive)';

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

const firstTimeoutLabel = (data: SeriesData, label: string): string => {
  const index = row(data, label).values.indexOf(null);

  const xLabel = index === -1 ? undefined : data.xLabels[index];

  if (xLabel === undefined) {
    throw new Error(`❌ ${label} never times out — the prose says it does`);
  }

  return xLabel;
};

/** Where RxJS first exceeds the timeout, and the last depth it survived. */
const rxjsTimeoutLabel = (): string =>
  firstTimeoutLabel(cascadedDiamond, 'RxJS');

const lastMeasuredLabel = (data: SeriesData, label: string): string => {
  const values = row(data, label).values;

  const index = values.findLastIndex((v) => v !== null);

  const xLabel = index === -1 ? undefined : data.xLabels[index];

  if (xLabel === undefined) {
    throw new Error(`❌ ${label} has no measurement that completed`);
  }

  return xLabel;
};

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
  lastMeasuredLabel(conditionalFanOut, SYNSTATE_NAIVE);

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

/** The largest branch count at which SynState's naive form still beats Jotai. */
const fanOutCrossoverLabel = (): string =>
  lastAheadLabel(conditionalFanOut, SYNSTATE_NAIVE, 'Jotai');

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

/**
 * Renders a measurement the way the prose quotes one: a tenth of a millisecond
 * below 100 ms, and whole milliseconds above it, where the tenth is noise.
 */
const ms = (value: number): string =>
  value < 100
    ? (`${value.toFixed(1)} ms` as const)
    : (`${count(Math.round(value))} ms` as const);

/**
 * Whether {@link factor} prints `value` with one decimal: below 10 once
 * rounded to that decimal, the way `toFixed` rounds it, so that 9.96 prints as
 * `10` rather than `10.0`.
 */
const inSingleDigits = (value: number): boolean =>
  value < 10 && value.toFixed(1) !== '10.0';

const divide = (numerator: number, denominator: number): number => {
  if (!Num.isNonZero(denominator)) {
    throw new Error('❌ cannot divide by zero');
  }

  return Num.div(numerator, denominator);
};

/**
 * A ratio as the summary quotes it: one decimal below 10, where "3.6×" and
 * "4×" say different things, and whole numbers above it, as {@link ratio}.
 */
const factor = (numerator: number, denominator: number): string => {
  const value = divide(numerator, denominator);

  return inSingleDigits(value) ? value.toFixed(1) : count(Math.round(value));
};

const ratio = (numerator: number, denominator: number): string =>
  count(Math.round(divide(numerator, denominator)));

/**
 * Where one measurement falls against another, in the steps the prose has
 * words for. Judged on the larger of the ratio and its inverse, as
 * {@link factor} prints it, so that "X against Y" and "Y against X" always
 * land on mirrored steps — the page compares in both directions. A ratio
 * above 1 changes step where its printed figure does; one below 1 is judged
 * from the other side, so a printed 0.8× can fall on either side of `level`:
 * symmetry is the property the prose needs, since it compares both ways.
 *
 * - `level`: within {@link LEVEL_WITHIN}× either way (up to 1.2× as printed,
 *   0.8× from the other side) — about the spread of one scenario between runs,
 *   so neither is ahead;
 * - `below` / `above`: further than that, up to {@link FAR_BEYOND}× either way;
 * - `far-below` / `far-above`: beyond {@link FAR_BEYOND}×.
 */
type Relation = 'far-below' | 'below' | 'level' | 'above' | 'far-above';

/**
 * A {@link Relation}, or the span the relations of several pairs cover, lower
 * step first — the only order {@link compared} writes one in.
 */
type Span =
  | Relation
  | 'far-below..below'
  | 'far-below..level'
  | 'far-below..above'
  | 'far-below..far-above'
  | 'below..level'
  | 'below..above'
  | 'below..far-above'
  | 'level..above'
  | 'level..far-above'
  | 'above..far-above';

const SPANS: readonly Span[] = [
  'far-below',
  'below',
  'level',
  'above',
  'far-above',
  'far-below..below',
  'far-below..level',
  'far-below..above',
  'far-below..far-above',
  'below..level',
  'below..above',
  'below..far-above',
  'level..above',
  'level..far-above',
  'above..far-above',
] as const;

const LEVEL_WITHIN = 1.2;

const FAR_BEYOND = 3;

const RELATIONS: readonly Relation[] = [
  'far-below',
  'below',
  'level',
  'above',
  'far-above',
] as const;

const relationOf = (numerator: number, denominator: number): Relation => {
  const value = divide(numerator, denominator);

  // Both quotients rather than the inverse of one, so that the mirrored
  // comparison computes exactly the same number.
  const larger = Math.max(value, divide(denominator, numerator));

  // What `factor` prints for the larger side, read back as a number.
  const parsed = Num.safeParseFloat(factor(larger, 1).replaceAll(',', ''));

  if (Result.isErr(parsed)) {
    throw new Error(`❌ cannot read back the ratio ${larger.toString()}`);
  }

  const printed = parsed.value;

  const step = printed <= LEVEL_WITHIN ? 0 : printed <= FAR_BEYOND ? 1 : 2;

  return value < 1
    ? (['level', 'below', 'far-below'] as const)[step]
    : (['level', 'above', 'far-above'] as const)[step];
};

/**
 * The words a sentence uses for how the `pairs` (numerator, denominator)
 * compare, keyed by their {@link Relation} — one, or the span `low..high`
 * when the pairs fall in several (`'level..above'`: level in some, above in
 * the rest).
 *
 * The numbers beside a comparative have been derived for a while; the word
 * was typed in, so a re-measurement that moved a library from ahead of
 * SynState to level with it left "faster than" in front of a 0.9×. Here a
 * sentence states which relations it has words for, and a measurement in any
 * other is an error naming the sentence: the data now say something the
 * sentence cannot, and it has to be rewritten rather than reworded by hand.
 */
const compared = (
  sentence: string,
  pairs: readonly FixedLengthTuple<2, number>[],
  words: Partial<ReadonlyRecord<Span, Localized>>,
): Localized => {
  const indices = pairs.map(([numerator, denominator]) =>
    RELATIONS.indexOf(relationOf(numerator, denominator)),
  );

  const low = RELATIONS[Math.min(...indices)];

  const high = RELATIONS[Math.max(...indices)];

  const written = low === high ? low : (`${low ?? ''}..${high ?? ''}` as const);

  const span = SPANS.find((candidate) => candidate === written);

  const wording = span === undefined ? undefined : words[span];

  if (wording === undefined) {
    throw new Error(
      `❌ ${sentence}: the measurements are now '${written}', which the sentence has no wording for — rewrite it against the tables`,
    );
  }

  return wording;
};

/**
 * The middle of `values`, the upper one on an even count; `undefined` when
 * there are none.
 */
const medianOf = (values: readonly number[]): number | undefined =>
  values.toSorted((a, b) => a - b)[Math.floor(divide(values.length, 2))];

/**
 * The median of the `pairs`' ratios, for "stays close to SynState as N grows,
 * typically N× its time". Not the furthest pair, which the sentence used to
 * quote as a bound at every point: the pairs it is used on are both below a
 * millisecond, where one point of a re-measurement on a shared runner can land
 * several times off its neighbors, so a bound over every point said more about
 * the noisiest run than about the library.
 *
 * Two errors, each judged on medians for the same reason: beyond
 * {@link TYPICAL_AT_MOST}× either way, since the sentences that quote one set
 * such a row against one that grows without limit, a contrast an order of
 * magnitude no longer makes; and a ratio whose later half of the sweep is more
 * than {@link FLAT_WITHIN}× its earlier half, which no longer stays close as
 * $N$ grows. `pairs` are in sweep order, as {@link everyPoint} yields them.
 */
const typicalFactor = (
  sentence: string,
  pairs: readonly FixedLengthTuple<2, number>[],
): string => {
  const ratios = pairs.map(([numerator, denominator]) =>
    divide(numerator, denominator),
  );

  const half = Math.floor(divide(ratios.length, 2));

  const value = medianOf(ratios);

  const earlier = medianOf(ratios.slice(0, half));

  const later = medianOf(ratios.slice(ratios.length - half));

  if (value === undefined || earlier === undefined || later === undefined) {
    throw new Error(
      `❌ ${sentence}: there are too few pairs to judge a trend across the sweep`,
    );
  }

  const apart = Math.max(value, divide(1, value));

  if (apart > TYPICAL_AT_MOST) {
    throw new Error(
      `❌ ${sentence}: the pairs are now typically ${factor(apart, 1)}× apart, too far for a sentence about staying close — rewrite it against the tables`,
    );
  }

  if (later > earlier * FLAT_WITHIN) {
    throw new Error(
      `❌ ${sentence}: the ratio now grows across the sweep (${factor(earlier, 1)}× in its earlier half, ${factor(later, 1)}× in its later half), which a sentence about staying close as N grows cannot say — rewrite it against the tables`,
    );
  }

  return factor(value, 1);
};

const TYPICAL_AT_MOST = 10;

const median = (data: StatsData, label: string): number => {
  const found = data.rows.find((r) => r.label === label);

  if (found === undefined) {
    throw new Error(`❌ '${label}' is not one of the measured libraries`);
  }

  return found.median;
};

/** One library's median beside another's, as a pair for {@link compared}. */
const medians = (
  data: StatsData,
  numerator: string,
  denominator: string,
): FixedLengthTuple<2, number> =>
  [median(data, numerator), median(data, denominator)] as const;

/**
 * One library's measurement beside another's at every point of a sweep. A
 * point either did not complete is an error rather than left out: a sentence
 * about every point would otherwise skip the one where the two are furthest
 * apart, and a median across the sweep would be taken over fewer points than
 * it says.
 */
const everyPoint = (
  data: SeriesData,
  numerator: string,
  denominator: string,
): readonly FixedLengthTuple<2, number>[] =>
  Arr.generate(function* () {
    for (const xLabel of data.xLabels) {
      const n = valueAt(data, numerator, xLabel);

      const d = valueAt(data, denominator, xLabel);

      if (n === null || d === null) {
        throw new Error(
          `❌ ${n === null ? numerator : denominator} did not complete '${xLabel}', so no sentence can compare it with ${n === null ? denominator : numerator} at every point`,
        );
      }

      yield [n, d] as const;
    }
  });

/** "X is faster than SynState" — the subject's time over SynState's. */
const SPEED = {
  'far-below': { en: 'faster than', ja: 'より高速' },
  'far-below..below': { en: 'faster than', ja: 'より高速' },
  below: { en: 'faster than', ja: 'より高速' },
  level: { en: 'about as fast as', ja: 'とほぼ同じ速さ' },
  above: { en: 'slower than', ja: 'より低速' },
  'above..far-above': { en: 'slower than', ja: 'より低速' },
  'far-above': { en: 'slower than', ja: 'より低速' },
} as const;

/** "Solid, MobX, Jotai and Redux are slower", with no object after it. */
const SPEED_PLURAL = {
  above: { en: 'slower', ja: 'より低速' },
  'above..far-above': { en: 'slower', ja: 'より低速' },
  'far-above': { en: 'slower', ja: 'より低速' },
} as const;

/** "Twice a very cheap pass costs less than one ordered pass." */
const PASS_COST = {
  'far-below': { en: 'less than', ja: 'より安い' },
  below: { en: 'less than', ja: 'より安い' },
  level: { en: 'about as much as', ja: 'とほぼ同じ' },
} as const;

/** "Its per-update overhead is close to SynState's" — subject over object. */
const OVERHEAD = {
  'far-below': { en: 'well below', ja: 'よりかなり小さい' },
  'far-below..below': { en: 'below', ja: 'より小さい' },
  below: { en: 'below', ja: 'より小さい' },
  'far-below..level': { en: 'at or below', ja: 'と同程度かそれより小さい' },
  'below..level': { en: 'at or below', ja: 'と同程度かそれより小さい' },
  level: { en: 'close to', ja: 'と同程度' },
  'level..above': { en: 'at or above', ja: 'と同程度かそれより大きい' },
  'level..far-above': { en: 'at or above', ja: 'と同程度かそれより大きい' },
  above: { en: 'above', ja: 'より大きい' },
  'above..far-above': { en: 'above', ja: 'より大きい' },
  'far-above': { en: 'well above', ja: 'よりかなり大きい' },
} as const;

/**
 * "Against Preact Signals these results name no consistent winner" — Preact
 * Signals' time over SynState's in each scenario the sentence lists. The
 * sentence goes on "it takes N× as long as SynState", so Preact Signals stays
 * the subject whichever way it falls.
 */
const WINNER = {
  ...sameFor(['far-below', 'far-below..below', 'below'], {
    en: 'it is ahead of SynState in all three',
    ja: '3つすべてで Preact Signals が速くなっています',
  }),
  ...sameFor(['far-below..level', 'below..level'], {
    en: 'it is ahead of SynState in some and level with it in the rest',
    ja: 'Preact Signals が速いシナリオと、SynState と同程度のシナリオがあります',
  }),
  ...sameFor(
    [
      'far-below..above',
      'far-below..far-above',
      'below..above',
      'below..far-above',
      'level',
    ],
    {
      en: 'these results name no consistent winner',
      ja: 'これらの結果に一貫した勝者はありません',
    },
  ),
  ...sameFor(['level..above', 'level..far-above'], {
    en: 'it trails SynState in some and is level with it in the rest',
    ja: 'SynState が速いシナリオと、SynState と同程度のシナリオがあります',
  }),
  ...sameFor(['above', 'above..far-above', 'far-above'], {
    en: 'it trails SynState in all three',
    ja: '3つすべてで SynState が速くなっています',
  }),
} as const;

/**
 * "Its cost stays within a small factor of SynState's" — no point beyond
 * {@link FAR_BEYOND}× either way.
 */
const SMALL_FACTOR = sameFor(
  ['below', 'below..level', 'below..above', 'level', 'level..above', 'above'],
  { en: 'a small factor', ja: '小さな定数倍' },
);

/** {@link SMALL_FACTOR}, for a sentence that says it is so on both sides. */
const SMALL_FACTOR_EITHER_WAY = sameFor(['below..above'], {
  en: 'a small factor',
  ja: '小さな定数倍',
});

/**
 * "Its per-update overhead is close to SynState's, because a rerun allocates
 * nothing" — {@link OVERHEAD} for a sentence whose reason explains a cost no
 * higher than SynState's, and so has no wording for one above it.
 */
const OVERHEAD_AT_MOST = {
  'far-below': OVERHEAD['far-below'],
  'far-below..below': OVERHEAD['far-below..below'],
  below: OVERHEAD.below,
  'far-below..level': OVERHEAD['far-below..level'],
  'below..level': OVERHEAD['below..level'],
  level: OVERHEAD.level,
} as const;

/** One wording for each of `spans`. */
function sameFor(
  spans: readonly Span[],
  words: Localized,
): Partial<ReadonlyRecord<Span, Localized>> {
  return Object.fromEntries(spans.map((span) => [span, words] as const));
}

/** A measurement as {@link ms} prints it, with the same rounding, as a number. */
const shownMs = (value: number): number => {
  if (value >= 100) {
    return Math.round(value);
  }

  const parsed = Num.safeParseFloat(value.toFixed(1));

  if (Result.isErr(parsed)) {
    throw new Error(`❌ cannot read back the measurement ${value.toString()}`);
  }

  return parsed.value;
};

/** A row's last three points against its first three, each side the mean. */
const endOverStart = (
  data: SeriesData,
  label: string,
): FixedLengthTuple<2, number> => {
  const { values } = row(data, label);

  const mean = (points: readonly (number | null)[]): number => {
    const measured = points.filter((v): v is number => v !== null);

    if (measured.length !== points.length || !Arr.isNonEmpty(measured)) {
      throw new Error(`❌ ${label} did not complete every end of the sweep`);
    }

    return divide(Arr.sum(measured), measured.length);
  };

  return [mean(Arr.takeLast(values, 3)), mean(Arr.take(values, 3))] as const;
};

const at = (data: SeriesData, label: string, xLabel: string): number => {
  const value = valueAt(data, label, xLabel);

  if (value === null) {
    throw new Error(`❌ ${label} has no measurement at '${xLabel}'`);
  }

  return value;
};

/**
 * "SynState's row stays flat" / "Jotai's row grows": the mean of the last three
 * points of a sweep against the mean of the first three, so that one point —
 * under a millisecond, where a point moves by half between runs — decides
 * nothing. Flat is within {@link FLAT_WITHIN}× either way, for the same reason.
 * Each sentence names the one trend its reasoning explains; any other is an
 * error naming it.
 */
const rowTrend = (
  sentence: string,
  data: SeriesData,
  label: string,
  quoted: FixedLengthTuple<2, string>,
  expected: 'flat' | 'grows',
): Localized => {
  const [end, start] = endOverStart(data, label);

  const change = divide(end, start);

  const trend =
    change > FLAT_WITHIN
      ? 'grows'
      : change * FLAT_WITHIN < 1
        ? 'falls'
        : 'flat';

  if (trend !== expected) {
    throw new Error(
      `❌ ${sentence}: the row now ${trend} (${factor(end, start)}× from start to end), which the sentence does not explain — rewrite it against the tables`,
    );
  }

  // The sentence quotes two points beside the word, as `ms` prints them: a
  // flat row must not show them more than `FLAT_WITHIN` apart, nor a growing
  // one show the later point lower.
  const [from, to] = quoted.map((xLabel) => shownMs(at(data, label, xLabel)));

  const shownFlat =
    from !== undefined &&
    to !== undefined &&
    (from === to ||
      (from > 0 &&
        to > 0 &&
        Math.max(divide(to, from), divide(from, to)) <= FLAT_WITHIN));

  const shownGrowing = from !== undefined && to !== undefined && to > from;

  if (trend === 'flat' ? !shownFlat : !shownGrowing) {
    throw new Error(
      `❌ ${sentence}: the points quoted beside the word (${quoted.join(', ')}) no longer show the row ${trend === 'flat' ? 'flat' : 'growing'}`,
    );
  }

  return trend === 'flat'
    ? { en: 'stays flat', ja: 'ほぼ横ばいです' }
    : { en: 'grows', ja: '増えます' };
};

const FLAT_WITHIN = 2;

/** The number in a column heading: `'N=16'` → `16`, `'B=1000'` → `1000`. */
const param = (xLabel: string): number => {
  const parsed = Num.safeParseInt(xLabel.split('=', 2)[1] ?? '');

  if (Result.isErr(parsed)) {
    throw new Error(`❌ no parameter value in the column heading '${xLabel}'`);
  }

  return parsed.value;
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

const timeout = (data: SeriesData): number => {
  const value = data.meta.timeoutMs;

  if (value === null) {
    throw new Error('❌ this scenario has no timeout');
  }

  return value;
};

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

/** `figure`, marked `>` where it is a lower bound. */
const lowerBoundMarked = (figure: string, isLowerBound: boolean): string =>
  isLowerBound
    ? // A no-break space, so that a narrow column does not wrap the mark away
      // from its number.
      (`>\u{A0}${figure}` as const)
    : figure;

/**
 * A distance from the fastest library as the summary quotes it, marked `>`
 * where the row timed out, which makes the figure a lower bound.
 */
const spreadText = (spread: number, timedOut: boolean): string =>
  lowerBoundMarked(factor(spread, 1), timedOut);

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
 * The fan-out rows the summary leaves out: the naive forms (`isNaiveForm`, the
 * same test that dashes them in the chart), SynState and RxJS written with a
 * `derive` / `combineLatest` over every branch, which the summary replaces with
 * their `switchMap` forms.
 */
const fanOutSummaryExcluded = (): readonly string[] =>
  conditionalFanOut.series.map((s) => s.label).filter(isNaiveForm);

/**
 * The fan-out row's name. Its point is the last one SynState's naive form
 * finished — the row that grows with $B$, so the first to time out — which a
 * slower machine can move, so the summary table's first column reads it from
 * here too.
 */
const fanOutSummaryName = (): Localized =>
  ({
    en: `[Conditional fan-out](#scenario-conditional-fan-out) (${fanOutLastLabel()})`,
    ja: `[条件付きファンアウト](#シナリオ-条件付きファンアウト)（${fanOutLastLabel()}）`,
  }) as const;

const nsPerUpdate = (totalMs: number, updateCount: number): number =>
  divide(totalMs * NS_PER_MS, updateCount);

const updates = (data: SeriesData | StatsData): number => {
  const value = data.meta.updates;

  if (value === null) {
    throw new Error('❌ this scenario varies its update count per point');
  }

  return value;
};

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
    perUpdateNs: (library) => ({
      library: nsPerUpdate(median(data, library), updates(data)),
      fastest: nsPerUpdate(median(data, fastestRow(data)), updates(data)),
    }),
  }) as const;

/**
 * A sweep read at one point. `forms` names, for a library measured in more
 * than one form, the row the summary counts for it; that row stands for the
 * library in `libraries`, since no row of such a library carries its bare name.
 */
const seriesScenario = (
  name: Localized,
  data: SeriesData,
  xLabel: string,
  updatesAtPoint: number | undefined,
  forms: ReadonlyRecord<string, string> = {},
): SummaryScenario => {
  const form = (library: string): string => forms[library] ?? library;

  const libraryOf = (label: string): string =>
    Object.entries(forms).find(([, formLabel]) => formLabel === label)?.[0] ??
    label;

  return {
    name,
    libraries: data.series.map((s) => libraryOf(s.label)),
    fastest: () => fastestAt(data, xLabel),
    spread: (library) => pointSpread(data, form(library), xLabel),
    timedOut: (library) => valueAt(data, form(library), xLabel) === null,
    perUpdateNs: (library) => {
      if (updatesAtPoint === undefined) {
        return undefined;
      }

      const value = valueAt(data, form(library), xLabel);

      return {
        library: nsPerUpdate(value ?? timeout(data), updatesAtPoint),
        fastest: nsPerUpdate(
          at(data, fastestAt(data, xLabel), xLabel),
          updatesAtPoint,
        ),
      };
    },
  };
};

/**
 * The update count of a deep chain point: `'K=1000, M=200'` → `1000`. The
 * results record none for the sweep, as it varies by point.
 */
const deepChainUpdates = (xLabel: string): number => {
  const kPart = xLabel
    .split(',')
    .map((part) => part.trim())
    .find((part) => part.startsWith('K='));

  if (kPart === undefined) {
    throw new Error(`❌ no update count K in the column heading '${xLabel}'`);
  }

  return param(kPart);
};

/**
 * A library name, with the footnote mark the summary table explains when the
 * library is one that glitches. Language-neutral, so one value serves both
 * pages.
 */
const glitchMarked = (label: string): string =>
  GLITCHING_LIBRARIES.includes(label) ? (`${label} ※1` as const) : label;

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
      deepChainUpdates(DEEP_MAX),
    ),
    seriesScenario(
      {
        en: `[Cascaded diamond](#scenario-cascaded-diamond) (${CASCADED_MAX})`,
        ja: `[カスケードダイアモンド](#シナリオ-カスケードダイアモンド)（${CASCADED_MAX}）`,
      },
      cascadedDiamond,
      CASCADED_MAX,
      // Each measurement builds the graph as well as updating it, and makes
      // only 100 updates, so the building is most of what it times.
      undefined,
    ),
    seriesScenario(
      fanOutSummaryName(),
      conditionalFanOut,
      fanOutLastLabel(),
      updates(conditionalFanOut),
      FAN_OUT_SUMMARY_FORMS,
    ),
  ] as const;

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
  /**
   * What one update costs `library` and the fastest library, in nanoseconds,
   * or `undefined` where the scenario's time is not a per-update cost (the
   * cascaded diamond spreads building its graph over too few updates). Where
   * `library` timed out, its cost is the timeout's, a lower bound.
   */
  perUpdateNs: (library: string) => PerUpdateNs | undefined;
}>;

type PerUpdateNs = Readonly<{ library: number; fastest: number }>;

/** A library's worst summary row, from {@link worstSummaryRow}. */
type WorstRow = Readonly<{ scenario: SummaryScenario; spread: number }>;

/**
 * A per-update cost as the per-library table prints it, in nanoseconds,
 * microseconds or milliseconds, whichever keeps the figure under 1,000, with
 * a tenth below 10. Each bound is read off the rounded figure, so that 999.6 ns
 * prints as `1.0 µs`, never `1000 ns`.
 */
const durationNs = (ns: number): string =>
  Math.round(ns) < 1000
    ? (`${factor(ns, 1)} ns` as const)
    : Math.round(divide(ns, 1000)) < 1000
      ? (`${factor(ns, 1000)} µs` as const)
      : (`${factor(ns, NS_PER_MS)} ms` as const);

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

/** Whether every summary row measured `library`. */
const inEveryScenario = (library: string): boolean =>
  summaryScenarios().every((s) => s.libraries.includes(library));

/**
 * A library name, with the footnote mark the page explains when some summary
 * rows did not measure the library, so that its worst case is over the others
 * only. Language-neutral, like {@link glitchMarked}.
 */
const partialMarked = (library: string): string =>
  inEveryScenario(library) ? library : (`${library} ※3` as const);

/**
 * The summary row where `library` is furthest from that row's fastest, among
 * the rows that measured it.
 */
const worstSummaryRow = (library: string): WorstRow => {
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
const worstCaseText = (
  library: string,
  { scenario, spread }: WorstRow = worstSummaryRow(library),
): string => spreadText(spread, scenario.timedOut(library));

/**
 * A library's worst case, `worst` from {@link worstSummaryRow}, as the
 * per-library table's cell prints it, `×` included; emphasized when it stays in
 * single digits, as the libraries that hold up in every scenario. Only a
 * library every summary row measured qualifies, since a worst case over some
 * rows alone (※3) says less. The class is styled in `src/styles/custom.css`.
 */
const worstCaseCell = (library: string, worst: WorstRow): string => {
  const text = `${worstCaseText(library, worst)}×` as const;

  return !worst.scenario.timedOut(library) &&
    inSingleDigits(worst.spread) &&
    inEveryScenario(library)
    ? (`<strong class="benchmark-emphasis">${text}</strong>` as const)
    : text;
};

/**
 * What one update costs in a library's worst row, beside what it costs the
 * fastest library there: a ratio says how far apart two libraries are, and
 * these say whether that is nanoseconds or milliseconds. A row whose time is
 * not a per-update cost prints an em dash, and a timed-out one a lower bound
 * marked as {@link spreadText} marks its ratio; the note under the table
 * explains both.
 */
const perUpdateCell = (library: string, worst: WorstRow): string => {
  const ns = worst.scenario.perUpdateNs(library);

  return ns === undefined
    ? '\u{2014}'
    : `${lowerBoundMarked(durationNs(ns.library), worst.scenario.timedOut(library))} / ${durationNs(ns.fastest)}`;
};

/**
 * The per-library table's cells, from {@link worstSummaryRow}.
 *
 * The note under the table explains the emphasis {@link worstCaseCell} gives,
 * so a re-measurement that leaves no cell emphasized is an error rather than a
 * note describing nothing on the page.
 */
const worstCaseRows = (): ReadonlyRecord<string, BenchmarkNumber> => {
  const rows = summaryLibraries().map((library) => {
    const worst = worstSummaryRow(library);

    return {
      // `Preact Signals` → `preact-signals`: a marker key has no spaces.
      key: library.toLowerCase().replaceAll(' ', '-'),
      library: partialMarked(library),
      scenario: worst.scenario.name,
      fastest: worst.scenario.fastest(),
      cell: worstCaseCell(library, worst),
      perUpdate: perUpdateCell(library, worst),
    };
  });

  if (rows.every(({ cell }) => !cell.startsWith('<strong'))) {
    throw new Error(
      '❌ no library holds its worst case in single digits: remove the note on the emphasis under the per-library table',
    );
  }

  return Object.fromEntries(
    rows.flatMap(({ key, library, scenario, fastest, cell, perUpdate }) => [
      [`summary/worst/${key}-library`, library],
      [`summary/worst/${key}-scenario`, scenario],
      [`summary/worst/${key}-fastest`, fastest],
      [`summary/worst/${key}-over-fastest-cell`, cell],
      [`summary/worst/${key}-per-update`, perUpdate],
    ]),
  );
};

/**
 * `clause`, which names or explains `library`'s worst summary row as the
 * scenario at `anchor` — or an error once the data pick another row for it,
 * since the clause would then describe a scenario that is not its worst.
 */
const whileWorstIn = (
  library: string,
  anchor: string,
  clause: Localized,
): Localized => {
  const worst = worstSummaryRow(library).scenario.name;

  if (!worst.en.includes(`(${anchor})`)) {
    throw new Error(
      `❌ ${library}'s worst row is now ${worst.en}, not ${anchor}: rewrite the sentence that describes it`,
    );
  }

  return clause;
};

/** The summary scenarios' anchors on the English page, for {@link whileWorstIn}. */
const DEEP_CHAIN = '#scenario-deep-chain-throughput';

const CASCADED_DIAMOND = '#scenario-cascaded-diamond';

const FAN_OUT = '#scenario-conditional-fan-out';

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
      slowestAt(conditionalFanOut, fanOutLastLabel(), fanOutSummaryExcluded()),
      fanOutLastLabel(),
    ),
  ] as const;

/**
 * The scenarios the prose calls the small graphs: one update reaches a handful
 * of nodes, so what is measured is each library's overhead per update.
 */
const SMALL_GRAPHS: readonly StatsData[] = [
  singleState,
  derivedChain,
  diamond,
] as const;

/**
 * The libraries the summary sets well apart from SynState on the small graphs.
 */
const HEAVY_LIBRARIES: readonly string[] = [
  'Solid',
  'MobX',
  'Jotai',
  'Redux',
] as const;

/** The libraries whose subscribers see intermediate values in a diamond. */
const GLITCHING_LIBRARIES: readonly string[] = ['RxJS'] as const;

/**
 * The library's typical cost across the sweep, for a row the prose calls
 * constant. The median rather than the mean, so that one slow first point —
 * the branch counts are measured in one process, warmest last — does not move
 * the figure the sentence quotes as "regardless of B".
 */
const typical = (data: SeriesData, label: string): number => {
  const value = medianOf(row(data, label).values.filter((v) => v !== null));

  if (value === undefined) {
    throw new Error(`❌ ${label} has no measurements at all`);
  }

  return value;
};

/**
 * The slope of SynState's naive fan-out row in nanoseconds, which is the figure that
 * makes "linear in B" concrete: the largest measured branch count's cost
 * spread over its branches and over the updates the runner drove.
 */
const nsPerBranchPerUpdate = (): string =>
  count(
    nsPerUpdate(
      at(conditionalFanOut, SYNSTATE_NAIVE, fanOutLastLabel()),
      param(fanOutLastLabel()) * updates(conditionalFanOut),
    ),
  );

const NS_PER_MS = 1_000_000;
