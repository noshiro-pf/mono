import { interval, skipWhile, take, type Observable } from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import { type StreamTestCase } from '../typedef';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  skipWhile$: Observable<number>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(10));

  const skipWhile$ = counter$.chain(skipWhile((i) => i < 5));

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    skipWhile$,
  };
};

export const skipWhileTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'skipWhile case 1',
    expectedOutput: [5, 6, 7, 8, 9],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, skipWhile$ } = createStreams(tick);
      return getStreamOutputAsPromise(skipWhile$, startSource);
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
];
