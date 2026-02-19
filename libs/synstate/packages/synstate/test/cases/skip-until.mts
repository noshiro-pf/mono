import {
  interval,
  skipUntil,
  take,
  timer,
  type Observable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

/*
  Time(ms)  0       200     400     600     800     1000    1200    1400    1600    1800
  Tick      0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18
  counter   0       1       2       3       4       5       6       7       8       9
  timer                                             *                               (900ms, tick 9)
  skipUntil                                                 5       6       7       8       9
*/

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  timer$: Observable<number>;
  skipUntil$: Observable<number>;
}> => {
  const interval$ = interval(tick * 2, true);

  const counter$ = interval$.pipe(take(10));

  const timer$ = timer(tick * 9, true);

  const skipUntil$ = counter$.pipe(skipUntil(timer$));

  return {
    startSource: () => {
      interval$.start();

      timer$.start();
    },
    counter$,
    timer$,
    skipUntil$,
  };
};

export const skipUntilTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'skipUntil case 1',
    expectedOutput: [5, 6, 7, 8, 9],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, skipUntil$ } = createStreams(tick);

      return getStreamHistoryAsPromise(skipUntil$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, timer$, skipUntil$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter  ', a);
      });

      timer$.subscribe((a) => {
        console.log('timer    ', a);
      });

      skipUntil$.subscribe((a) => {
        console.log('skipUntil', a);
      });

      startSource();
    },
  },
];
