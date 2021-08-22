import type { DeepReadonly } from '@noshiro/ts-utils';
import type { Observable } from '../../src';
import { interval, map, take, withIndex } from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import type { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<number>;
  doubleWithIndex$: Observable<readonly [number, number]>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(11));

  const doubleWithIndex$ = counter$.chain(map((x) => x * 2)).chain(withIndex());

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    doubleWithIndex$,
  };
};

export const withIndexTestCases: readonly [StreamTestCase<[number, number]>] = [
  {
    name: 'withIndex case 1',
    expectedOutput: [
      [0, 0],
      [1, 2],
      [2, 4],
      [3, 6],
      [4, 8],
      [5, 10],
      [6, 12],
      [7, 14],
      [8, 16],
      [9, 18],
      [10, 20],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, doubleWithIndex$ } = createStreams(tick);
      return getStreamOutputAsPromise(doubleWithIndex$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, doubleWithIndex$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      doubleWithIndex$.subscribe((a) => {
        console.log('doubleWithIndex', a);
      });

      startSource();
    },
  },
];
