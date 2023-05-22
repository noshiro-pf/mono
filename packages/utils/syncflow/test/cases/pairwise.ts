import {
  interval,
  pairwise,
  take,
  withInitialValue,
  type Observable,
} from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import { type StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
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

const createStreams2 = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint | -1>;
  pairwise$: Observable<readonly [number, number]>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$
    .chain(take(6))
    .chain(withInitialValue(-1 as const));

  const pairwise$ = counter$.chain(pairwise());

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    pairwise$,
  };
};

export const pairwiseTestCases: ArrayOfLength<
  2,
  StreamTestCase<[number, number]>
> = [
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
  {
    name: 'pairwise case 1',
    expectedOutput: [
      [-1, 0],
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, pairwise$ } = createStreams2(tick);
      return getStreamOutputAsPromise(pairwise$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, pairwise$ } = createStreams2(tick);

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
