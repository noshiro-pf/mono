import { interval, skip, take, type Observable } from '../../src/index.mjs';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  skip5$: Observable<number>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(10));

  const skip5$ = counter$.chain(skip(5));

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    skip5$,
  };
};

export const skipTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'skip case 1',
    expectedOutput: [5, 6, 7, 8, 9],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, skip5$ } = createStreams(tick);
      return getStreamOutputAsPromise(skip5$, startSource);
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
];
