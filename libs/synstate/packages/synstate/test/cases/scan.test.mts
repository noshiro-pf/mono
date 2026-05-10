import { type SafeUint } from 'ts-type-forge';
import { counter, scan, take, type Observable } from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  scan$: Observable<number>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter10$ = counter$.pipe(take(10));

  const scan$ = counter10$.pipe(scan((acc, curr) => acc + curr, 0));

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter10$,
    scan$,
  };
};

export const scanTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'scan case 1',
    expectedOutput: [0, 0, 1, 3, 6, 10, 15, 21, 28, 36, 45],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, scan$ } = createStreams(tick);

      return getStreamHistoryAsPromise(scan$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, scan$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });

      scan$.subscribe((a) => {
        console.log('scan   ', a);
      });

      startSource();
    },
  },
] as const;

for (const c of scanTestCases) {
  testStream(c);
}
