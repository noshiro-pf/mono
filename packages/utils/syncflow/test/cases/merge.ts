import type { IntervalObservable, Observable } from '../../src';
import { filter, interval, map, merge } from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import type { StreamTestCase } from '../typedef';

/*
  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23
  even      0       2       4       6       8       10      12      14      16      18      20      22
  odd          "1"     "3"     "5"     "7"     "9"     "11"    "13"    "15"    "17"    "19"    "21"    "23"
  merged    0  "1"  2  "3"  4  "5"  6  "7"  8  "9"  10 "11" 12 "13" 14 "15" 16 "17" 18 "19" 20 "21" 22 "23"
*/
const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  even$: Observable<number>;
  odd$: Observable<string>;
  merged$: Observable<number | string>;
} => {
  const counter$ = interval(tick, true);
  const even$ = counter$.chain(filter((n) => n % 2 === 0));
  const odd$ = counter$
    .chain(filter((n) => n % 2 === 1))
    .chain(map((a) => a.toString()));
  const merged$ = merge(even$, odd$);

  return {
    counter$,
    even$,
    odd$,
    merged$,
  };
};

export const mergeTestCases: [StreamTestCase<number | string>] = [
  {
    name: 'merge case 1',
    expectedOutput: [0, '1', 2, '3', 4, '5'],
    run: (take: number, tick: number): Promise<(number | string)[]> => {
      const { counter$, merged$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        merged$,
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
      const { counter$, even$, odd$, merged$ } = createStreams(tick);
      even$.subscribe((a) => {
        console.log('even', a);
      });
      odd$.subscribe((a) => {
        console.log('odd', a);
      });
      merged$.subscribe((a) => {
        console.log('merged', a);
      });

      counter$.start();
    },
  },
];
