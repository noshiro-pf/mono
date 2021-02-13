import { tuple } from '@noshiro/ts-utils';
import {
  filter,
  interval,
  IntervalObservable,
  map,
  mergeMap,
  Observable,
} from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import { StreamTestCase } from '../typedef';

/*
  counter         0                    1                    2                    3                    4
  sub counter 1   *     0     0     0     0     0
  sub counter 2                        *     0     1     2     3     4
  sub counter 3                                             *     0     2     4     6     8
  sub counter 4                                                                  *     0     3     6     9     12
  sub counter 4                                                                                       *     0     4     8     ...
  i                     0     0     0     0  1  0  1     1     1  2  1  2     2     2  3  2  3     3     3  4  3  4     4
  mergeMap              0     0     0     0  0  0  1     2     3  0  4  2     4     6  0  8  3     6     9  0  12 4     8
*/

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  mergeMap$: Observable<[number, number]>;
} => {
  const counter$ = interval(tick * 7, true);

  const mergeMap$ = counter$.chain(
    mergeMap((i) =>
      interval(tick * 2)
        .chain(filter((j) => j < 5))
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
      [1, 2],
      [1, 3],
      [2, 0],
      [1, 4],
      [2, 2],
      [2, 4],
      [2, 6],
      [3, 0],
      [2, 8],
      [3, 3],
      [3, 6],
      [3, 9],
      [4, 0],
      [3, 12],
      [4, 4],
      [4, 8],
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
