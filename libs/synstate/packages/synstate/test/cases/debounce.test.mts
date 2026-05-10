import { ISet } from 'ts-data-forge';
import { type SafeUint } from 'ts-type-forge';
import {
  counter,
  debounce,
  filter,
  merge,
  take,
  type Observable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

/*
  (tick)    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0

  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
  filtered  0       2   3                   9   10  11  12  13
                                |- 250ms ->                     |- 250ms ->
  debounced                     3                               13
*/
const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  filtered$: Observable<number>;
  debounce$: Observable<number>;
  merged$: Observable<number>;
}> => {
  const emitValues = ISet.create([0, 2, 3, 9, 10, 11, 12, 13]);

  const counter$ = counter(tick * 2, { startManually: true });

  const counter23$ = counter$.pipe(take(23));

  const filtered$ = counter23$.pipe(filter((n) => emitValues.has(n)));

  const debounce$ = filtered$.pipe(debounce(tick * 5));

  const merged$ = merge([filtered$, debounce$] as const);

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter23$,
    filtered$,
    debounce$,
    merged$,
  };
};

export const debounceTestCases: readonly [
  StreamTestCase<number>,
  StreamTestCase<number>,
] = [
  {
    name: 'debounce case 1',
    expectedOutput: [3, 13],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, debounce$ } = createStreams(tick);

      return getStreamHistoryAsPromise(debounce$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, filtered$, debounce$ } = createStreams(tick);

      filtered$.subscribe((a) => {
        console.log('filtered ', a);
      });

      debounce$.subscribe((a) => {
        console.log('debounce', a);
      });

      startSource();
    },
  },
  {
    name: 'debounce case 2',
    expectedOutput: [0, 2, 3, 3, 9, 10, 11, 12, 13, 13],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, merged$ } = createStreams(tick);

      return getStreamHistoryAsPromise(merged$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, filtered$, debounce$, merged$ } =
        createStreams(tick);

      filtered$.subscribe((a) => {
        console.log('filtered ', a);
      });

      debounce$.subscribe((a) => {
        console.log('debounce', a);
      });

      merged$.subscribe((a) => {
        console.log('merged   ', a);
      });

      startSource();
    },
  },
] as const;

for (const c of debounceTestCases) {
  testStream(c);
}
