import { counter, skipWhile, take, type Observable } from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  skipWhile$: Observable<number>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter10$ = counter$.pipe(take(10));

  const skipWhile$ = counter10$.pipe(skipWhile((i) => i < 5));

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter10$,
    skipWhile$,
  };
};

export const skipWhileTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'skipWhile case 1',
    expectedOutput: [5, 6, 7, 8, 9],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, skipWhile$ } = createStreams(tick);

      return getStreamHistoryAsPromise(skipWhile$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, skipWhile$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });

      skipWhile$.subscribe((a) => {
        console.log('skip   ', a);
      });

      startSource();
    },
  },
] as const;

for (const c of skipWhileTestCases) {
  testStream(c);
}
