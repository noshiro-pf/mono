import { type SafeUint } from 'ts-type-forge';
import { counter, skip, take, type Observable } from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  skip5$: Observable<number>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter10$ = counter$.pipe(take(10));

  const skip5$ = counter10$.pipe(skip(5));

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter10$,
    skip5$,
  };
};

export const skipTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'skip case 1',
    expectedOutput: [5, 6, 7, 8, 9],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, skip5$ } = createStreams(tick);

      return getStreamHistoryAsPromise(skip5$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, skip5$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });

      skip5$.subscribe((a) => {
        console.log('skip   ', a);
      });

      startSource();
    },
  },
] as const;

for (const c of skipTestCases) {
  testStream(c);
}
