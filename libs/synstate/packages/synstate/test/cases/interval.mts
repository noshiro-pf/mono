import { interval, take, type Observable } from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  output$: Observable<number>;
}> => {
  const interval$ = interval(tick, true);

  const counter$ = interval$.pipe(take(10));

  return {
    startSource: () => {
      interval$.start();
    },
    output$: counter$,
  };
};

export const intervalTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'interval case 1',
    expectedOutput: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, output$ } = createStreams(tick);

      return getStreamHistoryAsPromise(output$, startSource);
    },
    preview: (tick: number): void => {
      const { output$, startSource } = createStreams(tick);

      startSource();

      output$.subscribe((a) => {
        console.log('interval', a);
      });
    },
  },
];
