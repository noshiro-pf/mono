import type { Observable } from '../../src';
import { interval, take, takeUntil, timer } from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import type { StreamTestCase } from '../typedef';

/*
            0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19
  counter   0       1       2       3       4       5       6       7       8       9
  timer                                         *
  skip5                                             5       6       7       8       9
*/

const createStreams = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<number>;
  takeUntil$: Observable<number>;
}> => {
  const interval$ = interval(tick * 2, true);
  const counter$ = interval$.chain(take(10));

  const takeUntil$ = counter$.chain(takeUntil(timer(tick * 9)));

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
