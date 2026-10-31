import { Arr, expectType } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  cascadedDiamond,
  conditionalFanOut,
  deepChain,
  derivedChain,
  diamond,
  equalityCutOff,
  libraryColorOf,
  singleState,
} from '../src/data/index.mjs';
import type { BenchmarkEnvironment } from './benchmark/environment.mjs';

/**
 * The checks that hold for any measurement, whatever the prose says about it.
 *
 * `gen:benchmark-doc` runs them on the committed tables, and the benchmark
 * workflow runs them on its fresh measurement (`check-measurement.mts`) — which
 * it does not hand to `gen:benchmark-doc`, so that a near tie in one noisy
 * re-measurement does not fail the job that judges drift. Without that, a
 * measurement the page could not be generated from at all (two scenarios on
 * two dates, a library with no colour) would become a cached baseline before
 * anyone tried to commit it.
 *
 * Here rather than under `scripts/benchmark/`, whose every file is part of the
 * workflow's baseline cache key: a change to a check measures nothing, and
 * must not make `main` re-measure.
 */

/**
 * Where every table on the page was measured, or `undefined` when some table
 * records nothing: those predate the pinned runner, and the page says so
 * rather than inventing a machine for them.
 *
 * The scenarios must agree, the date included — `benchmark` measures all of
 * them in one pass, and re-measuring one alone (`benchmark:deep-chain`) is
 * useful on one machine and misleading across two, so a disagreement fails
 * here rather than being averaged into a claim. Each runner stamps the date
 * itself, so the workflow pins one for the whole pass
 * (`BENCHMARK_MEASURED_ON`, read in `scripts/benchmark/environment.mts`).
 */
export const recordedEnvironment = (): RecordedEnvironment | undefined => {
  const recorded = allResults
    .map((r) => r.meta.environment)
    .filter((e) => e !== undefined);

  const [first] = recorded;

  if (first === undefined || recorded.length < allResults.length) {
    return undefined;
  }

  const disagreements = Arr.generate(function* () {
    for (const key of ENVIRONMENT_KEYS) {
      const distinct = Arr.uniq(recorded.map((e) => JSON.stringify(e[key])));

      if (distinct.length > 1) {
        yield `  - ${key}: ${distinct.join(', ')}`;
      }
    }
  });

  if (Arr.isNonEmpty(disagreements)) {
    throw new Error(
      [
        'The scenarios disagree about where they were measured, so no single',
        'value describes the page:',
        ...disagreements,
        '',
        'Re-measure every scenario with',
        '`pnpm --filter @synstate/docs run benchmark`.',
      ].join('\n'),
    );
  }

  return first;
};

/**
 * Fails on a library the benchmark charts have no colour for.
 *
 * The charts draw a label `libraryColorOf` has no colour for in the axis grey,
 * which nothing notices: a runner that gained a library used to need it added
 * to a colour map per chart by hand. Checked here rather than in the chart,
 * because a throw there only fires in the reader's browser.
 */
export const assertEveryLibraryHasAColour = (): void => {
  const labels = [
    ...[cascadedDiamond, conditionalFanOut, deepChain, equalityCutOff].flatMap(
      ({ series }) => series.map(({ label }) => label),
    ),
    ...[singleState, derivedChain, diamond].flatMap(({ rows }) =>
      rows.map(({ label }) => label),
    ),
  ] as const;

  const missing = Arr.uniq(
    labels.filter((label) => libraryColorOf(label) === undefined),
  );

  if (Arr.isNonEmpty(missing)) {
    throw new Error(
      `❌ no chart colour for ${missing.join(', ')}; add it to src/data/library-colors.mts, then run \`pnpm run gen:benchmark-doc fix:fmt\` to embed the results`,
    );
  }
};

/**
 * The environment a results file records, as the checks and the prose read it.
 *
 * Optional in a results file because the tables committed before the
 * measurement moved to CI do not carry one — see {@link recordedEnvironment}.
 */
export type RecordedEnvironment = Readonly<{
  runner: string;
  runnerImage: string | null;
  node: string;
  platform: string;
  arch: string;
  cpu: string;
  measuredOn: string;
  libraries: ReadonlyRecord<string, string>;
}>;

/**
 * Every field a runner records, each compared on its own. The type check
 * below keeps it complete: a field added to what the runners write and not
 * here would let two machines that differ only in it pass as one.
 */
const ENVIRONMENT_KEYS = [
  'runner',
  'runnerImage',
  'node',
  'platform',
  'arch',
  'cpu',
  'measuredOn',
  'libraries',
] as const satisfies readonly (keyof RecordedEnvironment)[];

expectType<(typeof ENVIRONMENT_KEYS)[number], keyof BenchmarkEnvironment>('=');

expectType<keyof RecordedEnvironment, keyof BenchmarkEnvironment>('=');

/**
 * What these checks read of a results file. `updates`, which every runner
 * writes, is here only so that `meta` is not a weak type: TypeScript refuses
 * an object that shares no property with a type whose every property is
 * optional, and so would refuse the very tables without an environment that
 * {@link recordedEnvironment} tolerates.
 */
type ResultsWithEnvironment = Readonly<{
  meta: Readonly<{ updates: number | null; environment?: RecordedEnvironment }>;
}>;

/**
 * Every committed table: each is a table on the page, so the environment it
 * was measured in has to agree with the others' or the page's one-sentence
 * description of where the numbers come from is false.
 */
const allResults: readonly ResultsWithEnvironment[] = [
  singleState,
  derivedChain,
  diamond,
  deepChain,
  cascadedDiamond,
  conditionalFanOut,
  equalityCutOff,
] as const;
