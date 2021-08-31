import type { DeepReadonly } from '@noshiro/ts-utils';
import { tuple } from '@noshiro/ts-utils';
import type { Observable } from '../../src';
import {
  combineLatest,
  debounceTime,
  filter,
  interval,
  mapWithIndex,
  take,
} from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import type { StreamTestCase } from '../typedef';

/*
  (tick)    0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20
  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20
  even      0       2       4       6       8       10      12      14      16      18      20
  filtered  0   1   2   3   4                       10  11  12  13  14
  debounced                             4                                       14
  combined                              x   x       x       x       x       x   x   x       x
*/

const createStreams1 = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<number>;
  even$: Observable<number>;
  filtered$: Observable<number>;
  debounced$: Observable<number>;
  debouncedWithIndex$: Observable<readonly [number, number]>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(200));

  const even$ = counter$.chain(filter((n) => n % 2 === 0));
  const filtered$ = counter$.chain(filter((n) => n % 10 < 5));
  const debounced$ = filtered$.chain(debounceTime(tick * 3));
  const debouncedWithIndex$ = filtered$
    .chain(debounceTime(tick * 3))
    .chain(mapWithIndex((v, i) => tuple(i, v)));

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    even$,
    filtered$,
    debounced$,
    debouncedWithIndex$,
  };
};

const createStreams2 = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<number>;
  even$: Observable<number>;
  filtered$: Observable<number>;
  debounced$: Observable<number>;
  combined$: Observable<readonly [number, number]>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(40));

  const even$ = counter$.chain(filter((n) => n % 2 === 0));
  const filtered$ = counter$.chain(filter((n) => n % 10 < 5));
  const debounced$ = filtered$.chain(debounceTime(tick * 3));
  const combined$ = combineLatest([even$, debounced$] as const);

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    even$,
    filtered$,
    debounced$,
    combined$,
  };
};

export const debounceTimeTestCases: readonly [
  StreamTestCase<[number, number]>,
  StreamTestCase<[number, number]>
] = [
  {
    name: 'debounceTime case 1',
    expectedOutput: [
      [0, 4],
      [1, 14],
      [2, 24],
      [3, 34],
      [4, 44],
      [5, 54],
      [6, 64],
      [7, 74],
      [8, 84],
      [9, 94],
      [10, 104],
      [11, 114],
      [12, 124],
      [13, 134],
      [14, 144],
      [15, 154],
      [16, 164],
      [17, 174],
      [18, 184],
      [19, 194],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, debouncedWithIndex$ } = createStreams1(tick);
      return getStreamOutputAsPromise(debouncedWithIndex$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, filtered$, debounced$, debouncedWithIndex$ } =
        createStreams1(tick);

      filtered$.subscribe((a) => {
        console.log('filtered          ', a);
      });
      debounced$.subscribe((a) => {
        console.log('debounced         ', a);
      });
      debouncedWithIndex$.subscribe((a) => {
        console.log('debouncedWithIndex', a);
      });

      startSource();
    },
  },
  {
    name: 'debounceTime case 2',
    expectedOutput: [
      [6, 4],
      [8, 4],
      [10, 4],
      [12, 4],
      [14, 4],
      [16, 4],
      [16, 14],
      [18, 14],
      [20, 14],
      [22, 14],
      [24, 14],
      [26, 14],
      [26, 24],
      [28, 24],
      [30, 24],
      [32, 24],
      [34, 24],
      [36, 24],
      [36, 34],
      [38, 34],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, combined$ } = createStreams2(tick);
      return getStreamOutputAsPromise(combined$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, even$, debounced$, combined$ } =
        createStreams2(tick);

      even$.subscribe((a) => {
        console.log('even     ', a);
      });
      debounced$.subscribe((a) => {
        console.log('debounced', a);
      });
      combined$.subscribe((a) => {
        console.log('combined ', a);
      });

      startSource();
    },
  },
];
