import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { workspaceRootPath } from '../workspace-root-path.mjs';

/** The label of synstate-next's row, with the form it is written in, if any. */
export const subjectLabel = (form?: string): string =>
  form === undefined ? 'synstate-next' : (`synstate-next (${form})` as const);

/**
 * Whether a row is a library written the way nobody would write it, kept to
 * show what that costs: such a row is left out of the slowest column and every
 * library's worst case.
 */
export const isNaiveForm = (label: string): boolean =>
  splitLabel(label).form?.startsWith('naive') === true;

/** Whether a row is synstate-next's. */
export const isSubject = (label: string): boolean =>
  libraryOf(label) === subjectLabel();

/**
 * The label of synstate's row, with the form it is written in, if any:
 * synstate is the library synstate-next replaces, measured beside it so that
 * the page shows what the rewrite changed.
 */
export const predecessorLabel = (form?: string): string =>
  form === undefined ? 'synstate' : (`synstate (${form})` as const);

/**
 * Whether a row is synstate's. Such a row is shown in its scenario's table and
 * left out of the comparison with the other libraries: the fastest, the slowest
 * and every library's worst case. The rows go when synstate-next replaces
 * synstate.
 */
export const isPredecessor = (label: string): boolean =>
  libraryOf(label) === predecessorLabel();

/**
 * The predecessor's row that `label`, one of synstate-next's, is compared with:
 * the same form, written with synstate.
 */
export const predecessorOf = (label: string): string => {
  if (!isSubject(label)) {
    throw new Error(`${label} is not one of synstate-next's rows`);
  }

  return predecessorLabel(splitLabel(label).form);
};

/**
 * The library a row measures: its label without the form it is written in, so
 * that `RxJS (switchMap)` counts as RxJS.
 */
export const libraryOf = (label: string): string => splitLabel(label).library;

/**
 * The libraries measured in every scenario with a derived value but RxJS, which
 * some scenarios measure in two forms.
 */
const librariesButRxjs = [
  'MobX',
  'Jotai',
  'Redux',
  'Solid',
  'Preact Signals',
] as const;

/** The libraries measured in every scenario with a derived value. */
const signalLibraries = Arr.toUnshifted('RxJS')(librariesButRxjs);

/**
 * The npm package of each library the scenarios measure but synstate-next, by
 * the name its rows carry; `run-benchmark.mts` reads their versions.
 */
// Keyed by `string`: the labels pass through `others()` as strings, so there is
// no union of them to key on. `scenarios.test.mts` fails, naming the row, when
// one is missing here, and `run-benchmark.mts` stops before measuring anything,
// naming the library, for a run that skipped the test.
export const packageOf: ReadonlyRecord<string, string> = {
  synstate: 'synstate',
  RxJS: 'rxjs',
  MobX: 'mobx',
  Jotai: 'jotai',
  Redux: '@reduxjs/toolkit',
  Solid: 'solid-js',
  'Preact Signals': '@preact/signals-core',
  Zustand: 'zustand',
  Valtio: 'valtio',
} as const;

/** Where the scenario files of the other libraries live. */
const synstateBenchmarkDir = path.resolve(
  workspaceRootPath,
  '../../libs/synstate/samples/docs-site/benchmark',
);

const throughputAdapters = path.resolve(
  workspaceRootPath,
  '../synstate-docs/src/components/throughput-demo/adapters/index.mts',
);

/** Where `run-benchmark.mts` writes what it measured. */
export const resultsPath = path.resolve(
  workspaceRootPath,
  'src/data/benchmark-results.json',
);

// These helpers come before `scenarios`, which calls them while the module
// loads.
const next = (name: string): string =>
  path.resolve(
    workspaceRootPath,
    '../../libs/synstate-next/samples/docs-site/benchmark',
    `${name}.mts`,
  );

const synstateSample = (name: string): string =>
  path.resolve(synstateBenchmarkDir, `${name}.mts`);

/**
 * synstate-next's row and synstate's, from the samples `<prefix>.synstate-next`
 * and `<prefix>.synstate`.
 */
const subjectAndPredecessor = (prefix: string): readonly Entry[] =>
  [
    { label: subjectLabel(), file: next(`${prefix}.synstate-next`) },
    { label: predecessorLabel(), file: synstateSample(`${prefix}.synstate`) },
  ] as const;

const others = (prefix: string, labels: readonly string[]): readonly Entry[] =>
  labels.map((label) => ({
    label,
    file: synstateSample(
      `${prefix}.${label.toLowerCase().replaceAll(' ', '-')}`,
    ),
  }));

/**
 * The scenarios of the benchmark page and the libraries each measures, read by
 * both the runner (`run-benchmark.mts`) and the page generator
 * (`embed-benchmark.mts`).
 *
 * synstate-next's code is its own, in `libs/synstate-next/samples/`, tested
 * there like every other sample on this site. The other libraries' code is the
 * code the synstate documentation measures and shows, in
 * `libs/synstate/samples/` and, for the deep chain, the adapters of its
 * throughput demo, so that the two sites time the other libraries the same way.
 * synstate's rows, right after synstate-next's, are timed from the same code.
 */
export const scenarios = [
  {
    id: 'single-state',
    listsOthers: true,
    kind: 'stats',
    // The value each `runBenchmark(n)` returns, per update.
    perUpdate: 1,
    entries: [
      ...subjectAndPredecessor('00-single-state'),
      ...others('00-single-state', [
        'RxJS',
        'MobX',
        'Jotai',
        'Redux',
        'Solid',
        'Preact Signals',
        'Zustand',
        'Valtio',
      ]),
    ],
  },
  {
    id: 'derived-chain',
    listsOthers: true,
    kind: 'stats',
    perUpdate: 4,
    entries: [
      ...subjectAndPredecessor('01-derived-chain'),
      ...others('01-derived-chain', signalLibraries),
    ],
  },
  {
    id: 'diamond',
    listsOthers: true,
    kind: 'stats',
    perUpdate: 5,
    entries: [
      ...subjectAndPredecessor('02-diamond-dependency'),
      ...others('02-diamond-dependency', signalLibraries),
    ],
  },
  {
    id: 'deep-chain',
    // The page links to synstate's throughput demo, whose adapters these are.
    listsOthers: false,
    kind: 'deep-chain',
    entries: Arr.toUnshifted({
      label: subjectLabel(),
      file: next('03-deep-chain.synstate-next'),
      factory: 'createSynStateNextThroughputAdapter',
    })(
      (
        [
          [predecessorLabel(), 'createSynStateThroughputAdapter'],
          ['RxJS', 'createRxJSThroughputAdapter'],
          ['MobX', 'createMobXThroughputAdapter'],
          ['Jotai', 'createJotaiThroughputAdapter'],
          ['Redux', 'createReduxThroughputAdapter'],
          ['Solid', 'createSolidThroughputAdapter'],
          ['Preact Signals', 'createPreactSignalsThroughputAdapter'],
        ] as const
      ).map(([label, factory]) => ({
        label,
        file: throughputAdapters,
        factory,
      })),
    ),
  },
  {
    id: 'cascaded-diamond',
    // The page links to the other libraries' code rather than show six more
    // long listings.
    listsOthers: false,
    kind: 'sweep',
    entries: [
      ...subjectAndPredecessor('04-cascaded-diamond'),
      ...others('04-cascaded-diamond', signalLibraries),
    ],
  },
  {
    id: 'conditional-fan-out',
    listsOthers: true,
    kind: 'sweep',
    entries: [
      {
        label: subjectLabel('switchMap'),
        file: next('05-conditional-fan-out.synstate-next'),
      },
      {
        label: subjectLabel('naive derive'),
        file: next('05-conditional-fan-out.naive.synstate-next'),
      },
      {
        label: predecessorLabel('switchMap'),
        file: synstateSample('05-conditional-fan-out.synstate-switch-map'),
      },
      {
        label: predecessorLabel('naive derive'),
        file: synstateSample('05-conditional-fan-out.synstate'),
      },
      {
        label: 'RxJS (switchMap)',
        file: synstateSample('05-conditional-fan-out.rxjs-switch-map'),
      },
      {
        label: 'RxJS (naive combineLatest)',
        file: synstateSample('05-conditional-fan-out.rxjs'),
      },
      ...others('05-conditional-fan-out', librariesButRxjs),
    ],
  },
  {
    id: 'unchanged-value',
    listsOthers: true,
    kind: 'sweep',
    entries: [
      ...subjectAndPredecessor('06-equality-cut-off'),
      {
        label: 'RxJS (distinctUntilChanged)',
        file: synstateSample('06-equality-cut-off.rxjs'),
      },
      {
        label: 'RxJS (naive, no distinctUntilChanged)',
        file: synstateSample('06-equality-cut-off.rxjs-naive'),
      },
      ...others('06-equality-cut-off', librariesButRxjs),
    ],
  },
] as const satisfies readonly Scenario[];

export type ScenarioId = (typeof scenarios)[number]['id'];

export type Scenario = Readonly<{
  id: string;
  kind: 'stats' | 'sweep' | 'deep-chain';
  /**
   * Whether the page shows the other libraries' code beside synstate-next's,
   * which `embed-samples.mts` fills in the order of `entries`.
   */
  listsOthers: boolean;
  perUpdate?: number;
  entries: readonly Entry[];
}>;

export type Entry = Readonly<{
  label: string;
  /** The module that exports the library's `runBenchmark` or adapter. */
  file: string;
  /** For the deep chain: the export that creates the library's adapter. */
  factory?: string;
}>;

/**
 * A row's label, `<library>` or `<library> (<form>)`, split at the first ` (`:
 * a library's name holds no ` (`, a form may. The one place that reads the
 * label's grammar, so that `libraryOf`, `predecessorOf` and `isNaiveForm` agree
 * on where the form starts.
 */
const splitLabel = (
  label: string,
): Readonly<{ library: string; form: string | undefined }> => {
  const groups = /^(?<library>.*?) \((?<form>.*)\)$/u.exec(label)?.groups;

  return {
    library: groups?.['library'] ?? label,
    form: groups?.['form'],
  };
};
