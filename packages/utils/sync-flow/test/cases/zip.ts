import { Observable } from '../../src/abstract_class';
import { zip } from '../../src/combine';
import { interval, IntervalObservable } from '../../src/create';
import { filter } from '../../src/operators';
import { StreamTestCase } from '../typedef';
import { getStreamOutputAsPromise } from '../utils';

/*
  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23
  even      0       2       4       6       8       10      12      14      16      18      20      22
  n%3       0           3           6           9           12          15          18          21
  zipped    [0,0]       [2,3]       [4,6]       [6,9]       [8,12]      [10,15]     [12,18]     [14,21]
*/
const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  even$: Observable<number>;
  multiplesOf3$: Observable<number>;
  zipped$: Observable<[number, number]>;
} => {
  const counter$ = interval(tick);
  const even$ = counter$.pipe(filter((n) => n % 2 === 0));
  const multiplesOf3$ = counter$.pipe(filter((n) => n % 3 === 0));

  const zipped$ = zip(even$, multiplesOf3$);

  return {
    counter$,
    even$,
    multiplesOf3$,
    zipped$,
  };
};

export const zipTestCases: StreamTestCase<[number, number]>[] = [
  {
    name: 'merge case 1',
    numTakeDefault: 12,
    run: (take: number, tick: number): Promise<[number, number][]> => {
      const { counter$, zipped$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        zipped$,
        take,
        () => {
          counter$.start();
        },
        () => {
          counter$.stop();
        }
      );
    },
    preview: (tick: number): void => {
      const { counter$, even$, multiplesOf3$, zipped$ } = createStreams(tick);
      even$.subscribe((a) => console.log('even', a));
      multiplesOf3$.subscribe((a) => console.log('multiplesOf3', a));
      zipped$.subscribe((a) => console.log('zipped', a));

      counter$.start();
    },
  },
];
