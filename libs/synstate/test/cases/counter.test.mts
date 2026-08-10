import { counter, take, type Observable } from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  output$: Observable<number>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter10$ = counter$.pipe(take(10));

  return {
    startSource: () => {
      counter$.start();
    },
    output$: counter10$,
  };
};

export const counterTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'counter case 1',
    expectedOutput: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, output$ } = createStreams(tick);

      return getStreamHistoryAsPromise(output$, startSource);
    },
    preview: (tick: number): void => {
      const { output$, startSource } = createStreams(tick);

      startSource();

      output$.subscribe((a) => {
        console.log('counter', a);
      });
    },
  },
] as const;

for (const c of counterTestCases) {
  testStream(c);
}
