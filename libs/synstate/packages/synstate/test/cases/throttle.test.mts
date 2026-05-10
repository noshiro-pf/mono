import { ISet } from 'ts-data-forge';
import { type SafeUint } from 'ts-type-forge';
import {
  counter,
  filter,
  merge,
  take,
  throttle,
  type Observable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

/*
  (tick)    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0

  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
  filtered  0       2   3                   9   10  11  12  13
  throttled 0           3                   9               12
            |---------->|---------->        |---------->    |---------->
*/
const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  filtered$: Observable<number>;
  throttle$: Observable<number>;
  merged$: Observable<number>;
}> => {
  const emitValues = ISet.create([0, 2, 3, 9, 10, 11, 12, 13]);

  const counter$ = counter(tick * 2, { startManually: true });

  const counter23$ = counter$.pipe(take(23));

  const filtered$ = counter23$.pipe(filter((n) => emitValues.has(n)));

  const throttle$ = filtered$.pipe(throttle(tick * 5));

  const merged$ = merge([filtered$, throttle$]);

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter23$,
    filtered$,
    throttle$,
    merged$,
  };
};

export const throttleTestCases: readonly [
  StreamTestCase<number>,
  StreamTestCase<number>,
] = [
  {
    name: 'throttle case 1',
    expectedOutput: [0, 3, 9, 12],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, throttle$ } = createStreams(tick);

      return getStreamHistoryAsPromise(throttle$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, filtered$, throttle$ } =
        createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter     ', a);
      });

      filtered$.subscribe((a) => {
        console.log('filtered    ', a);
      });

      throttle$.subscribe((a) => {
        console.log('throttle', a);
      });

      startSource();
    },
  },
  {
    name: 'throttle case 2',
    expectedOutput: [0, 2, 3, 9, 10, 11, 12, 13],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, merged$ } = createStreams(tick);

      return getStreamHistoryAsPromise(merged$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, filtered$, throttle$, merged$ } =
        createStreams(tick);

      filtered$.subscribe((a) => {
        console.log('filtered    ', a);
      });

      throttle$.subscribe((a) => {
        console.log('throttle', a);
      });

      merged$.subscribe((a) => {
        console.log('merged      ', a);
      });

      startSource();
    },
  },
] as const;

for (const c of throttleTestCases) {
  testStream(c);
}
