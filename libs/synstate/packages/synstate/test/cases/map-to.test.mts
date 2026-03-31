import { counter, mapTo, take, type Observable } from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  output$: Observable<string>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter5$ = counter$.pipe(take(5));

  const output$ = counter5$.pipe(mapTo('1'));

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter5$,
    output$,
  };
};

export const mapToTestCases: readonly [StreamTestCase<string>] = [
  {
    name: 'mapTo case 1',
    expectedOutput: ['1', '1', '1', '1', '1'],
    run: (tick: number): Promise<readonly string[]> => {
      const { startSource, output$ } = createStreams(tick);

      return getStreamHistoryAsPromise(output$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, output$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter ', a);
      });

      output$.subscribe((a) => {
        console.log('constant', a);
      });

      startSource();
    },
  },
] as const;

for (const c of mapToTestCases) {
  testStream(c);
}
