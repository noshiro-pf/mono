import type { Observable } from '../../src';
import { interval, skipUntil, take, timer } from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import type { StreamTestCase } from '../typedef';

/*
  (tick)    0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19
  counter   0       1       2       3       4       5       6       7       8       9
  timer                                         *
  skipUntil                                         5       6       7       8       9
*/

const createStreams = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<number>;
  timer$: Observable<number>;
  skipUntil$: Observable<number>;
}> => {
  const interval$ = interval(tick * 2, true);
  const counter$ = interval$.chain(take(10));

  const timer$ = timer(tick * 9, true);

  const skipUntil$ = counter$.chain(skipUntil(timer$));

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
      return getStreamOutputAsPromise(skipUntil$, startSource);
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
