import { tp } from '@noshiro/ts-utils';
import {
  interval,
  map,
  switchMap,
  take,
  type Observable,
} from '../../src/index.mjs';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

/*
  (tick)          0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5  6  7  8  9
  counter         0                    1                    2                    3                    4
  sub counter 1   0     0     0     0     0
  sub counter 2                        0     1     2     3     4
  sub counter 3                                             0     2     4     6     8
  sub counter 4                                                                  0     3     6     9     12
  sub counter 5                                                                                       0     4     8     ...
  switchMap       0     0     0     0  0     1     2     3  0     2     4     6  0     3     6     9  0     4     8
*/

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  switchMap$: Observable<readonly [number, number]>;
}> => {
  const interval$ = interval(tick * 7, true);
  const counter$ = interval$.chain(take(10));

  const switchMap$ = counter$.chain(take(7)).chain(
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    switchMap((i) =>
      interval(tick * 2)
        .chain(take(5))
        .chain(map((x) => tp(i, x * i))),
    ),
  );

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    switchMap$,
  };
};

export const switchMapTestCases: readonly [StreamTestCase<[number, number]>] = [
  {
    name: 'switchMap case 1',
    expectedOutput: [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
      [2, 2],
      [2, 4],
      [2, 6],
      [3, 0],
      [3, 3],
      [3, 6],
      [3, 9],
      [4, 0],
      [4, 4],
      [4, 8],
      [4, 12],
      [5, 0],
      [5, 5],
      [5, 10],
      [5, 15],
      [6, 0],
      [6, 6],
      [6, 12],
      [6, 18],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, switchMap$ } = createStreams(tick);
      return getStreamOutputAsPromise(switchMap$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, switchMap$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter  ', a);
      });
      switchMap$.subscribe((a) => {
        console.log('switchMap', a);
      });

      startSource();
    },
  },
];
