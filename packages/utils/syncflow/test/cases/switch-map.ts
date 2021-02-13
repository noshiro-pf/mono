import { tuple } from '@noshiro/ts-utils';
import {
  filter,
  interval,
  IntervalObservable,
  map,
  Observable,
  switchMap,
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
  switchMap             0     0     0        0     1     2        0     2     4        0     3     6        0     4     8
*/

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  switchMap$: Observable<[number, number]>;
} => {
  const counter$ = interval(tick * 7, true);

  const switchMap$ = counter$.chain(
    switchMap((i) =>
      interval(tick * 2)
        .chain(filter((j) => j < 5))
        .chain(map((x) => tuple(i, x * i)))
    )
  );

  return { counter$, switchMap$ };
};

export const switchMapTestCases: [StreamTestCase<[number, number]>] = [
  {
    name: 'switchMap case 1',
    expectedOutput: [
      [0, 0],
      [0, 0],
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 0],
      [2, 2],
      [2, 4],
      [3, 0],
      [3, 3],
      [3, 6],
      [4, 0],
      [4, 4],
      [4, 8],
      [5, 0],
      [5, 5],
      [5, 10],
      [6, 0],
      [6, 6],
      [6, 12],
    ],
    run: (take: number, tick: number): Promise<[number, number][]> => {
      const { counter$, switchMap$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        switchMap$,
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
      const { counter$, switchMap$ } = createStreams(tick / 3.5);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      switchMap$.subscribe((a) => {
        console.log('switchMap', a);
      });

      counter$.start();
    },
  },
];
