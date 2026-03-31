import { expectType, isNumber } from 'ts-data-forge';
import {
  counter,
  filter,
  source,
  take,
  type Observable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

/*
  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20
  even      0       2       4       6       8       10      12      14      16      18      20
  filtered  0   1   2   3   4                       10  11  12  13  14
*/

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  even$: Observable<number>;
  filtered$: Observable<number>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter20$ = counter$.pipe(take(20));

  const even$ = counter20$.pipe(filter((n) => n % 2 === 0));

  const filtered$ = counter20$.pipe(filter((n) => n % 10 < 5));

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter20$,
    even$,
    filtered$,
  };
};

export const filterTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'filter case 1',
    expectedOutput: [0, 1, 2, 3, 4, 10, 11, 12, 13, 14],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, filtered$ } = createStreams(tick);

      return getStreamHistoryAsPromise(filtered$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, even$, filtered$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter ', a);
      });

      even$.subscribe((a) => {
        console.log('even    ', a);
      });

      filtered$.subscribe((a) => {
        console.log('filtered', a);
      });

      startSource();
    },
  },
] as const;

for (const c of filterTestCases) {
  testStream(c);
}

// type tests
const obs$ = source<string | number>(0).pipe(filter(isNumber));

if (import.meta.vitest !== undefined) {
  test('type-check', () => {
    expectType<typeof obs$, Observable<number>>('=');

    expect(obs$).toBe(obs$);
  });
}
