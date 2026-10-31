import { hasKey } from 'ts-data-forge';

/**
 * The colour each benchmark chart draws a library in, keyed by the `label` the
 * runners write into `results-*.json` — every results file, charted or not, so
 * that a chart added for a scenario has its colours already.
 *
 * One map for every chart, so that a library is the same colour wherever it
 * appears and a runner that gains one has a single place to name it.
 * `gen:benchmark-doc`, and the benchmark workflow on its fresh measurement,
 * fail on a results label missing here (`assertEveryLibraryHasAColour` in
 * `scripts/measurement-checks.mts`): the chart itself would only fall back to
 * the axis grey, which no check notices.
 * Both read it through {@link libraryColorOf}, so that the check and the chart
 * cannot disagree on which labels have a colour.
 */
export const libraryColorOf = (label: string): string | undefined =>
  hasKey(libraryColors, label) ? libraryColors[label] : undefined;

/**
 * Whether a chart draws `label` dashed: the rows a runner labels `(naive…)`.
 *
 * Those are written naively on purpose, to show what a static graph that holds
 * every branch costs. Drawn like the others, the fan-out's naive SynState row
 * read as SynState's own growth with the branch count, which its natural
 * `switchMap` form does not have. Read from the label rather than listed here,
 * so that a naive row cannot be added without being drawn as one. Each is
 * given the paler colour of its library below, which no check enforces.
 */
export const isNaiveForm = (label: string): boolean => label.includes('(naive');

const libraryColors = {
  SynState: '#3b82f6',
  'SynState (switchMap)': '#3b82f6',
  'SynState (naive derive)': '#93c5fd',
  RxJS: '#ef4444',
  'RxJS (switchMap)': '#ef4444',
  'RxJS (naive combineLatest)': '#fca5a5',
  Jotai: '#f59e0b',
  MobX: '#8b5cf6',
  Redux: '#14b8a6',
  Solid: '#ec4899',
  'Preact Signals': '#84cc16',
  Zustand: '#92400e',
  Valtio: '#64748b',
} as const;
