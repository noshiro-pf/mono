import { counter, take, takeWhile, type Observable } from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  takeWhile$: Observable<number>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter10$ = counter$.pipe(take(10));

  const takeWhile$ = counter10$.pipe(takeWhile((i) => i < 5));

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter10$,
    takeWhile$,
  };
};

export const takeWhileTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'takeWhile case 1',
    expectedOutput: [0, 1, 2, 3, 4],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, takeWhile$ } = createStreams(tick);

      return getStreamHistoryAsPromise(takeWhile$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, takeWhile$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter  ', a);
      });

      takeWhile$.subscribe((a) => {
        console.log('takeWhile', a);
      });

      startSource();
    },
  },
] as const;

for (const c of takeWhileTestCases) {
  testStream(c);
}
