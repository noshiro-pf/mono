import { counter, take, type Observable } from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  take5$: Observable<number>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter10$ = counter$.pipe(take(10));

  const take5$ = counter10$.pipe(take(5));

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter10$,
    take5$,
  };
};

export const takeTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'take case 1',
    expectedOutput: [0, 1, 2, 3, 4],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, take5$ } = createStreams(tick);

      return getStreamHistoryAsPromise(take5$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, take5$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });

      take5$.subscribe((a) => {
        console.log('take   ', a);
      });

      startSource();
    },
  },
] as const;

for (const c of takeTestCases) {
  testStream(c);
}
