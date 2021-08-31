import type { DeepReadonly } from '@noshiro/ts-utils';
import type { Observable } from '../../src';
import { interval, pairwise, take } from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import type { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<number>;
  pairwise$: Observable<readonly [number, number]>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(6));

  const pairwise$ = counter$.chain(pairwise());

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    pairwise$,
  };
};

export const pairwiseTestCases: readonly [StreamTestCase<[number, number]>] = [
  {
    name: 'pairwise case 1',
    expectedOutput: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, pairwise$ } = createStreams(tick);
      return getStreamOutputAsPromise(pairwise$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, pairwise$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter ', a);
      });
      pairwise$.subscribe((a) => {
        console.log('pairwise', a);
      });

      startSource();
    },
  },
];
