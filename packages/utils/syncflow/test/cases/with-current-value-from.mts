import {
  interval,
  map,
  take,
  withCurrentValueFrom,
  type Observable,
} from '../../src/index.mjs';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  withCurrentValueFrom$: Observable<readonly [number, number]>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(11));

  const double$ = counter$.chain(map((x) => x * 2));
  const withCurrentValueFrom$ = counter$.chain(withCurrentValueFrom(double$));

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    withCurrentValueFrom$,
  };
};

export const withCurrentValueFromTestCases: readonly [
  StreamTestCase<[number, number]>,
] = [
  {
    name: 'withCurrentValueFrom case 1',
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
      const { startSource, withCurrentValueFrom$ } = createStreams(tick);
      return getStreamOutputAsPromise(withCurrentValueFrom$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, withCurrentValueFrom$ } =
        createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter             ', a);
      });
      withCurrentValueFrom$.subscribe((a) => {
        console.log('withCurrentValueFrom', a);
      });

      startSource();
    },
  },
];
