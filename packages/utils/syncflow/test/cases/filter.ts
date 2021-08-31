import type { Observable } from '../../src';
import { filter, interval, take } from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import type { StreamTestCase } from '../typedef';

/*
  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20
  even      0       2       4       6       8       10      12      14      16      18      20
  filtered  0   1   2   3   4                       10  11  12  13  14
*/

const createStreams = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<number>;
  even$: Observable<number>;
  filtered$: Observable<number>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(20));

  const even$ = counter$.chain(filter((n) => n % 2 === 0));
  const filtered$ = counter$.chain(filter((n) => n % 10 < 5));
  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
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
      return getStreamOutputAsPromise(filtered$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, even$, filtered$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      even$.subscribe((a) => {
        console.log('even', a);
      });
      filtered$.subscribe((a) => {
        console.log('filtered', a);
      });

      startSource();
    },
  },
];
