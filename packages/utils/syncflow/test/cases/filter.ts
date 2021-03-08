import { filter, interval, IntervalObservable, Observable } from '../../src';
import { StreamTestCase } from '../typedef';
import { getStreamOutputAsPromise } from '../utils';

/*
  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20
  even      0       2       4       6       8       10      12      14      16      18      20
  filtered  0   1   2   3   4                       10  11  12  13  14
*/

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  even$: Observable<number>;
  filtered$: Observable<number>;
} => {
  const counter$ = interval(tick, false);
  const even$ = counter$.chain(filter((n) => n % 2 === 0));
  const filtered$ = counter$.chain(filter((n) => n % 10 < 5));
  return {
    counter$,
    even$,
    filtered$,
  };
};

export const filterTestCases: [StreamTestCase<number>] = [
  {
    name: 'filter case 1',
    expectedOutput: [0, 1, 2, 3, 4, 10, 11, 12, 13, 14],
    run: (take: number, tick: number): Promise<number[]> => {
      const { counter$, filtered$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        filtered$,
        take,
        () => {
          counter$.start();
        },
        () => {
          counter$.complete();
        }
      );
    },
    preview: (tick: number): void => {
      const { counter$, even$, filtered$ } = createStreams(tick);

      even$.subscribe((a) => {
        console.log('even', a);
      });
      filtered$.subscribe((a) => {
        console.log('filtered', a);
      });

      counter$.start();
    },
  },
];
