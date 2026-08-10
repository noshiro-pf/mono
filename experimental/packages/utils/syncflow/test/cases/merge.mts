import {
  filter,
  interval,
  map,
  merge,
  take,
  type Observable,
} from '../../src/index.mjs';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

/*
  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23
  even      0       2       4       6       8       10      12      14      16      18      20      22
  odd          "1"     "3"     "5"     "7"     "9"     "11"    "13"    "15"    "17"    "19"    "21"    "23"
  merged    0  "1"  2  "3"  4  "5"  6  "7"  8  "9"  10 "11" 12 "13" 14 "15" 16 "17" 18 "19" 20 "21" 22 "23"
*/
const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  even$: Observable<number>;
  odd$: Observable<string>;
  merged$: Observable<number | string>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(6));

  const even$ = counter$.chain(filter((n) => n % 2 === 0));
  const odd$ = counter$
    .chain(filter((n) => n % 2 === 1))
    .chain(map((a) => a.toString()));
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const merged$ = merge([even$, odd$] as const);

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    even$,
    odd$,
    merged$,
  };
};

export const mergeTestCases: readonly [StreamTestCase<number | string>] = [
  {
    name: 'merge case 1',
    expectedOutput: [0, '1', 2, '3', 4, '5'],
    run: (tick: number): Promise<readonly (number | string)[]> => {
      const { startSource, merged$ } = createStreams(tick);
      return getStreamOutputAsPromise(merged$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, even$, odd$, merged$ } = createStreams(tick);
      even$.subscribe((a) => {
        console.log('even  ', a);
      });
      odd$.subscribe((a) => {
        console.log('odd   ', a);
      });
      merged$.subscribe((a) => {
        console.log('merged', a);
      });

      startSource();
    },
  },
];
