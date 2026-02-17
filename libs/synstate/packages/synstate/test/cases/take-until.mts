import {
  interval,
  take,
  takeUntil,
  timer,
  type Observable,
} from '../../src/index.mjs';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise.mjs';
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
  const interval$ = interval(tick * 2, true);

  const counter$ = interval$.pipe(take(10));

  const takeUntil$ = counter$.pipe(takeUntil(timer(tick * 9)));

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    takeUntil$,
  };
};

export const takeUntilTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'takeUntil case 1',
    expectedOutput: [0, 1, 2, 3, 4],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, takeUntil$ } = createStreams(tick);

      return getStreamOutputAsPromise(takeUntil$, startSource);
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
];
