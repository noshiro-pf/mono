import {
  interval,
  take,
  takeWhile,
  type Observable,
} from '../../src/index.mjs';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  takeWhile$: Observable<number>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(10));

  const takeWhile$ = counter$.chain(takeWhile((i) => i < 5));

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    takeWhile$,
  };
};

export const takeWhileTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'takeWhile case 1',
    expectedOutput: [0, 1, 2, 3, 4],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, takeWhile$ } = createStreams(tick);
      return getStreamOutputAsPromise(takeWhile$, startSource);
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
];
