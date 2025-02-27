import { interval, mapTo, take, type Observable } from '../../src/index.mjs';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  output$: Observable<string>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(5));

  const output$ = counter$.chain(mapTo('1'));

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    output$,
  };
};

export const mapToTestCases: readonly [StreamTestCase<string>] = [
  {
    name: 'mapTo case 1',
    expectedOutput: ['1', '1', '1', '1', '1'],
    run: (tick: number): Promise<readonly string[]> => {
      const { startSource, output$ } = createStreams(tick);
      return getStreamOutputAsPromise(output$, startSource);
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
];
