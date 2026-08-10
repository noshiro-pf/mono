import {
  interval,
  map,
  skipIfNoChange,
  take,
  withCurrentValueFrom,
  type Observable,
} from '../../src/index.mjs';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

/*
  counter         0   1   2   3   4   5   6
  skipIfNoChange  0           1           2
  withCurrentValueFrom      00  1   2   31  4   5   6
*/

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  skipIfNoChange$: Observable<number>;
  withCurrentValueFrom$: Observable<readonly [number, number]>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(10));

  const skipIfNoChange$ = counter$
    .chain(map((i) => Math.floor(i / 3)))
    .chain(skipIfNoChange());

  const withCurrentValueFrom$ = skipIfNoChange$.chain(
    withCurrentValueFrom(counter$),
  );

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    skipIfNoChange$,
    withCurrentValueFrom$,
  };
};

export const skipIfNoChangeTestCases: readonly [
  StreamTestCase<[number, number]>,
] = [
  {
    name: 'skipIfNoChange case 1',
    expectedOutput: [
      [0, 0],
      [1, 3],
      [2, 6],
      [3, 9],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, withCurrentValueFrom$ } = createStreams(tick);
      return getStreamOutputAsPromise(withCurrentValueFrom$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, skipIfNoChange$, withCurrentValueFrom$ } =
        createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter       ', a);
      });
      skipIfNoChange$.subscribe((a) => {
        console.log('skipIfNoChange', a);
      });
      withCurrentValueFrom$.subscribe((a) => {
        console.log('withCurrentValueFrom    ', a);
      });

      startSource();
    },
  },
];
