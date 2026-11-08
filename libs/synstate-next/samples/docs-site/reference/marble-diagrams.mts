/**
 * The marble diagrams of the reference pages, as data: the site draws them, and
 * `marble-diagrams-check.mts` runs each operator on the inputs and checks that
 * it gives the output drawn. Imports nothing, so that the site's generator can
 * read it without synstate-next built.
 */
import type { ReadonlyRecord } from 'ts-type-forge';

/** A value on a timeline, `t` tens of milliseconds after the start (0–100). */
export type Marble = Readonly<{ t: number; value: number | string }>;

export type MarbleDiagram = Readonly<{
  /** What the box between the inputs and the output says. */
  operator: string;
  inputs: readonly (readonly Marble[])[];
  /** The output, each value as its label: a tuple is its items joined. */
  output: readonly Readonly<{ t: number; label: string }>[];
}>;

const ticks = (
  ...pairs: readonly (readonly [t: number, value: number | string])[]
): readonly Marble[] => pairs.map(([t, value]) => ({ t, value }));

const out = (
  ...pairs: readonly (readonly [t: number, label: string])[]
): MarbleDiagram['output'] => pairs.map(([t, label]) => ({ t, label }));

const burst = ticks([5, 1], [10, 2], [15, 3], [45, 4], [52, 5], [80, 6]);

export const marbleDiagrams = {
  map: {
    operator: 'map((x) => x * 10)',
    inputs: [ticks([10, 1], [30, 2], [50, 2], [70, 3])],
    output: out([10, '10'], [30, '20'], [70, '30']),
  },
  filter: {
    operator: 'filter((x) => x % 2 === 0)',
    inputs: [ticks([10, 1], [25, 2], [40, 3], [55, 4], [70, 5], [85, 6])],
    output: out([25, '2'], [55, '4'], [85, '6']),
  },
  scan: {
    operator: 'scan((acc, x) => acc + x, 0)',
    inputs: [ticks([20, 1], [40, 2], [60, 3], [80, 4])],
    output: out([0, '0'], [20, '1'], [40, '3'], [60, '6'], [80, '10']),
  },
  pairwise: {
    operator: 'pairwise()',
    inputs: [ticks([15, 'a'], [35, 'b'], [55, 'c'], [75, 'd'])],
    output: out([35, 'ab'], [55, 'bc'], [75, 'cd']),
  },
  take: {
    operator: 'take(2)',
    inputs: [ticks([15, 1], [35, 2], [55, 3], [75, 4])],
    output: out([15, '1'], [35, '2']),
  },
  skip: {
    operator: 'skip(2)',
    inputs: [ticks([15, 1], [35, 2], [55, 3], [75, 4])],
    output: out([55, '3'], [75, '4']),
  },
  'take-while': {
    operator: 'takeWhile((x) => x < 3)',
    inputs: [ticks([15, 1], [35, 2], [55, 3], [75, 1])],
    output: out([15, '1'], [35, '2']),
  },
  'skip-while': {
    operator: 'skipWhile((x) => x < 3)',
    inputs: [ticks([15, 1], [35, 2], [55, 3], [75, 1])],
    output: out([55, '3'], [75, '1']),
  },
  'take-until': {
    operator: 'takeUntil(notifier)',
    inputs: [
      ticks([10, 1], [25, 2], [40, 3], [55, 4], [70, 5], [85, 6]),
      ticks([48, 'x']),
    ],
    output: out([10, '1'], [25, '2'], [40, '3']),
  },
  'skip-until': {
    operator: 'skipUntil(notifier)',
    inputs: [
      ticks([10, 1], [25, 2], [40, 3], [55, 4], [70, 5], [85, 6]),
      ticks([48, 'x']),
    ],
    output: out([55, '4'], [70, '5'], [85, '6']),
  },
  'skip-if-no-change': {
    operator: 'skipIfNoChange()',
    inputs: [ticks([10, 1], [25, 1], [40, 2], [55, 2], [70, 1])],
    output: out([10, '1'], [40, '2'], [70, '1']),
  },
  'with-initial-value': {
    operator: 'withInitialValue(0)',
    inputs: [ticks([30, 1], [60, 2])],
    output: out([0, '0'], [30, '1'], [60, '2']),
  },
  debounce: {
    operator: 'debounce(200)',
    inputs: [burst],
    output: out([35, '3'], [72, '5'], [100, '6']),
  },
  throttle: {
    operator: 'throttle(200)',
    inputs: [burst],
    output: out([5, '1'], [45, '4'], [80, '6']),
  },
  audit: {
    operator: 'audit(200)',
    inputs: [burst],
    output: out([25, '3'], [65, '5'], [100, '6']),
  },
  'switch-map': {
    operator: 'switchMap((x) => timer(200).pipe(map(() => x)))',
    inputs: [ticks([10, 'a'], [20, 'b'], [60, 'c'])],
    output: out([40, 'b'], [80, 'c']),
  },
  'merge-map': {
    operator: 'mergeMap((x) => timer(200).pipe(map(() => x)))',
    inputs: [ticks([10, 'a'], [20, 'b'], [60, 'c'])],
    output: out([30, 'a'], [40, 'b'], [80, 'c']),
  },
  combine: {
    operator: 'combine([letters, digits])',
    inputs: [ticks([10, 'a'], [40, 'b'], [80, 'c']), ticks([20, 1], [60, 2])],
    output: out([20, 'a1'], [40, 'b1'], [60, 'b2'], [80, 'c2']),
  },
  derive: {
    operator: 'derive([letters, digits], (l, d) => l + d)',
    inputs: [ticks([10, 'a'], [40, 'b'], [80, 'c']), ticks([20, 1], [60, 2])],
    output: out([20, 'a1'], [40, 'b1'], [60, 'b2'], [80, 'c2']),
  },
  merge: {
    operator: 'merge([letters, digits])',
    inputs: [ticks([10, 'a'], [40, 'b'], [80, 'c']), ticks([25, 1], [60, 2])],
    output: out([10, 'a'], [25, '1'], [40, 'b'], [60, '2'], [80, 'c']),
  },
  zip: {
    operator: 'zip([letters, digits])',
    inputs: [ticks([10, 'a'], [20, 'b'], [30, 'c']), ticks([45, 1], [70, 2])],
    output: out([45, 'a1'], [70, 'b2']),
  },
  'with-current-value-from': {
    operator: 'withCurrentValueFrom(digits)',
    inputs: [
      ticks([10, 'a'], [40, 'b'], [60, 'c'], [85, 'd']),
      ticks([25, 1], [70, 2]),
    ],
    output: out([40, 'b1'], [60, 'c1'], [85, 'd2']),
  },
  'with-buffered-from': {
    operator: 'withBufferedFrom(digits)',
    inputs: [ticks([30, 'a'], [70, 'b']), ticks([10, 1], [20, 2], [50, 3])],
    output: out([30, 'a12'], [70, 'b3']),
  },
  counter: {
    operator: 'counter(200, { times: 5 })',
    inputs: [],
    output: out([0, '0'], [20, '1'], [40, '2'], [60, '3'], [80, '4']),
  },
  timer: {
    operator: 'timer(300)',
    inputs: [],
    output: out([30, '0']),
  },
  'from-promise': {
    operator: 'fromPromise(a promise that resolves to 42 at 400 ms)',
    inputs: [],
    output: out([40, '42']),
  },
} as const satisfies ReadonlyRecord<string, MarbleDiagram>;

export type MarbleDiagramSlug = keyof typeof marbleDiagrams;
