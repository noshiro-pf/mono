import { type FixedLengthTuple, type SafeUint } from 'ts-type-forge';
import {
  counter,
  map,
  take,
  withCurrentValueFrom,
  type Observable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  withCurrentValueFrom$: Observable<FixedLengthTuple<2, number>>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter11$ = counter$.pipe(take(11));

  const double$ = counter11$.pipe(map((x) => x * 2));

  const withCurrentValueFrom$ = counter11$.pipe(withCurrentValueFrom(double$));

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter11$,
    withCurrentValueFrom$,
  };
};

export const withCurrentValueFromTestCases: readonly [
  StreamTestCase<FixedLengthTuple<2, number>>,
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
    run: (tick: number): Promise<readonly FixedLengthTuple<2, number>[]> => {
      const { startSource, withCurrentValueFrom$ } = createStreams(tick);

      return getStreamHistoryAsPromise(withCurrentValueFrom$, startSource);
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
] as const;

for (const c of withCurrentValueFromTestCases) {
  testStream(c);
}
