import {
  audit,
  combine,
  counter,
  debounce,
  derive,
  filter,
  fromPromise,
  map,
  merge,
  mergeMap,
  pairwise,
  scan,
  skip,
  skipIfNoChange,
  skipUntil,
  skipWhile,
  source,
  switchMap,
  take,
  takeUntil,
  takeWhile,
  throttle,
  timer,
  withBufferedFrom,
  withCurrentValueFrom,
  withInitialValue,
  zip,
  type Observable,
  type Source,
} from 'synstate-next';
import { Arr } from 'ts-data-forge';
import { Result } from 'ts-std-forge';
import {
  marbleDiagrams,
  type MarbleDiagram,
  type MarbleDiagramSlug,
} from './marble-diagrams.mjs';

type Value = number | string;

/** Builds the output of a diagram from sources that emit its inputs. */
type Run = (a: Source<Value>, b: Source<Value>) => Observable<unknown>;

const num = (x: Value): number => Number(x);

const runs: readonly (readonly [MarbleDiagramSlug, Run])[] = [
  ['map', (a) => a.pipe(map((x) => num(x) * 10))],
  ['filter', (a) => a.pipe(filter((x) => num(x) % 2 === 0))],
  ['scan', (a) => a.pipe(scan((acc: number, x) => acc + num(x), 0))],
  ['pairwise', (a) => a.pipe(pairwise())],
  ['take', (a) => a.pipe(take(2))],
  ['skip', (a) => a.pipe(skip(2))],
  ['take-while', (a) => a.pipe(takeWhile((x) => num(x) < 3))],
  ['skip-while', (a) => a.pipe(skipWhile((x) => num(x) < 3))],
  ['take-until', (a, notifier) => a.pipe(takeUntil(notifier))],
  ['skip-until', (a, notifier) => a.pipe(skipUntil(notifier))],
  ['skip-if-no-change', (a) => a.pipe(skipIfNoChange())],
  ['with-initial-value', (a) => a.pipe(withInitialValue(0))],
  ['debounce', (a) => a.pipe(debounce(200))],
  ['throttle', (a) => a.pipe(throttle(200))],
  ['audit', (a) => a.pipe(audit(200))],
  [
    'switch-map',
    (a) => a.pipe(switchMap((x) => timer(200).pipe(map(() => x)))),
  ],
  ['merge-map', (a) => a.pipe(mergeMap((x) => timer(200).pipe(map(() => x))))],
  ['combine', (letters, digits) => combine([letters, digits])],
  [
    'derive',
    (letters, digits) => derive([letters, digits], (l, d) => `${l}${d}`),
  ],
  ['merge', (letters, digits) => merge([letters, digits])],
  ['zip', (letters, digits) => zip([letters, digits])],
  [
    'with-current-value-from',
    (letters, digits) => letters.pipe(withCurrentValueFrom(digits)),
  ],
  [
    'with-buffered-from',
    (letters, digits) => letters.pipe(withBufferedFrom(digits)),
  ],
  ['counter', () => counter(200, { times: 5 })],
  ['timer', () => timer(300)],
  [
    'from-promise',
    () =>
      fromPromise(
        new Promise<number>((resolve) => {
          setTimeout(() => {
            resolve(42);
          }, 400);
        }),
      ),
  ],
] as const;

/** A value as its marble shows it: a tuple's items joined, a result's value. */
const label = (value: unknown): string =>
  Arr.isArray(value)
    ? value.map(label).join('')
    : Result.isResult(value)
      ? label(value.value)
      : typeof value === 'number'
        ? value.toString()
        : JSON.stringify(value).replaceAll('"', '');

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  describe('the marble diagrams of the reference pages', () => {
    test('every diagram is checked', () => {
      assert.deepStrictEqual(
        runs.map(([slug]) => slug).toSorted(),
        Object.keys(marbleDiagrams).toSorted(),
      );
    });

    test.each(runs)('%s', async (slug, run) => {
      vi.useFakeTimers();

      try {
        const diagram: MarbleDiagram = marbleDiagrams[slug];

        const start = Date.now();

        const a = source<Value>();

        const b = source<Value>();

        for (const [i, input] of [a, b].entries()) {
          for (const { t, value } of diagram.inputs[i] ?? []) {
            setTimeout(() => {
              input.next(value);
            }, t * 10);
          }
        }

        const mut_seen: { t: number; label: string }[] = [];

        run(a, b).subscribe((value) => {
          mut_seen.push({ t: (Date.now() - start) / 10, label: label(value) });
        });

        await vi.advanceTimersByTimeAsync(1100);

        assert.deepStrictEqual(mut_seen, diagram.output);
      } finally {
        vi.useRealTimers();
      }
    });
  });
}
