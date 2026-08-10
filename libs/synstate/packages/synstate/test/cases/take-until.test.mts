import { type SafeUint } from 'ts-type-forge';
import {
  counter,
  take,
  takeUntil,
  timer,
  type Observable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

/*
  Time(ms)  0       200     400     600     800     1000    1200    1400    1600    1800
  Tick      0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18
  counter   0       1       2       3       4       5       6       7       8       9
  timer                                             *                               (900ms, tick 9)
  takeUntil 0       1       2       3       4
*/

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  takeUntil$: Observable<number>;
}> => {
  const counter$ = counter(tick * 2, { startManually: true });

  const counter10$ = counter$.pipe(take(10));

  const takeUntil$ = counter10$.pipe(takeUntil(timer(tick * 9)));

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter10$,
    takeUntil$,
  };
};

export const takeUntilTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'takeUntil case 1',
    expectedOutput: [0, 1, 2, 3, 4],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, takeUntil$ } = createStreams(tick);

      return getStreamHistoryAsPromise(takeUntil$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, takeUntil$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter  ', a);
      });

      takeUntil$.subscribe((a) => {
        console.log('takeUntil', a);
      });

      startSource();
    },
  },
] as const;

for (const c of takeUntilTestCases) {
  testStream(c);
}
