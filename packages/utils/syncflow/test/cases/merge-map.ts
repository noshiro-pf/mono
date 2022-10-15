import { tp } from '@noshiro/ts-utils';
import type { Observable } from '../../src';
import { interval, map, mergeMap, take } from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import type { StreamTestCase } from '../typedef';

/*
  (tick)          0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9
  counter         0                    1                    2                    3                    4
  sub counter 1   0     0     0     0     0
  sub counter 2                        0     1     2     3     4
  sub counter 3                                             0     2     4     6     8
  sub counter 4                                                                  0     3     6     9     12
  sub counter 4                                                                                       0     4     8     ...
  i               0     0     0     0  1  0  1     1     1  2  1  2     2     2  3  2  3     3     3  4  3  4     4
  mergeMap        0     0     0     0  0  0  1     2     3  0  4  2     4     6  0  8  3     6     9  0  12 4     8
*/

const createStreams = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<number>;
  mergeMap$: Observable<readonly [number, number]>;
}> => {
  const interval$ = interval(tick * 7, true);
  const counter$ = interval$.chain(take(7));

  const mergeMap$ = counter$.chain(take(5)).chain(
    // eslint-disable-next-line deprecation/deprecation
    mergeMap((i) =>
      interval(tick * 2)
        .chain(take(5))
        .chain(map((x) => tp(i, x * i)))
    )
  );

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    mergeMap$,
  };
};

export const mergeMapTestCases: readonly [StreamTestCase<[number, number]>] = [
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
      [4, 12],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, mergeMap$ } = createStreams(tick);
      return getStreamOutputAsPromise(mergeMap$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, mergeMap$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter ', a);
      });
      mergeMap$.subscribe((a) => {
        console.log('mergeMap', a);
      });

      startSource();
    },
  },
];
