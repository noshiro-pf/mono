import { tp } from 'ts-data-forge';
import {
  interval,
  mapWithIndex,
  take,
  type Observable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  doubleWithIndex$: Observable<readonly [number, number]>;
}> => {
  const interval$ = interval(tick, true);

  const counter$ = interval$.pipe(take(11));

  const doubleWithIndex$ = counter$.pipe(mapWithIndex((x, i) => tp(i, x * 2)));

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    doubleWithIndex$,
  };
};

export const mapWithIndexTestCases: readonly [
  StreamTestCase<readonly [number, number]>,
] = [
  {
    name: 'mapWithIndex case 1',
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

      return getStreamHistoryAsPromise(doubleWithIndex$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, doubleWithIndex$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter        ', a);
      });

      doubleWithIndex$.subscribe((a) => {
        console.log('doubleWithIndex', a);
      });

      startSource();
    },
  },
];
