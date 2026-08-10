import { type FixedLengthTuple, type SafeUint } from 'ts-type-forge';
import {
  counter,
  map,
  skipIfNoChange,
  take,
  withCurrentValueFrom,
  type Observable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
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
  withCurrentValueFrom$: Observable<FixedLengthTuple<2, number>>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter10$ = counter$.pipe(take(10));

  const skipIfNoChange$ = counter10$
    .pipe(map((i) => Math.floor(i / 3)))
    .pipe(skipIfNoChange());

  const withCurrentValueFrom$ = skipIfNoChange$.pipe(
    withCurrentValueFrom(counter10$),
  );

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter10$,
    skipIfNoChange$,
    withCurrentValueFrom$,
  };
};

export const skipIfNoChangeTestCases: readonly [
  StreamTestCase<FixedLengthTuple<2, number>>,
] = [
  {
    name: 'skipIfNoChange case 1',
    expectedOutput: [
      [0, 0],
      [1, 3],
      [2, 6],
      [3, 9],
    ],
    run: (tick: number): Promise<readonly FixedLengthTuple<2, number>[]> => {
      const { startSource, withCurrentValueFrom$ } = createStreams(tick);

      return getStreamHistoryAsPromise(withCurrentValueFrom$, startSource);
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
] as const;

for (const c of skipIfNoChangeTestCases) {
  testStream(c);
}
