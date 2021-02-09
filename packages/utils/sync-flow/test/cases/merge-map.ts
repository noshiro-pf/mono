import { tuple } from '@mono/ts-utils';
import {
  filter,
  interval,
  IntervalObservable,
  map,
  mergeMap,
  Observable,
} from '../../src';
import { StreamTestCase } from '../typedef';
import { getStreamOutputAsPromise } from '../utils';

/*
  counter         0                    1                    2                    3                    4
  sub counter 1   0     0     0     0     0     0
  sub counter 2                        0     1     2     3     4     5
  sub counter 3                                             0     2     4     6     8     10
  sub counter 4                                                                  0     3     6     9     12    15
  sub counter 4                                                                                       0     4     8     ...
  mergeMap        0     0     0     0  0  0  1  0  2     3  0  4  2  5  4     6  0  8  3  10 6     9     12 4  15 8
*/

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  mergeMap$: Observable<[number, number]>;
} => {
  const counter$ = interval(tick * 3.5, false);

  const mergeMap$ = counter$.chain(
    mergeMap((i) =>
      interval(tick)
        .chain(filter((i) => i <= 5))
        .chain(map((x) => tuple(i, x * i)))
    )
  );

  return { counter$, mergeMap$ };
};

export const mergeMapTestCases: [StreamTestCase<[number, number]>] = [
  {
    name: 'mergeMap case 1',
    expectedOutput: [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [1, 0],
      [0, 0],
      [1, 1],
      [0, 0],
      [1, 2],
      [1, 3],
      [2, 0],
      [1, 4],
      [2, 2],
      [1, 5],
      [2, 4],
      [2, 6],
      [3, 0],
      [2, 8],
      [3, 3],
      [2, 10],
      [3, 6],
      [3, 9],
      [4, 0],
      [3, 12],
      [4, 4],
      [3, 15],
      [4, 8],
      [4, 12],
    ],
    run: (take: number, tick: number): Promise<[number, number][]> => {
      const { counter$, mergeMap$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        mergeMap$,
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
      const { counter$, mergeMap$ } = createStreams(tick / 3.5);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      mergeMap$.subscribe((a) => {
        console.log('mergeMap', a);
      });

      counter$.start();
    },
  },
];
