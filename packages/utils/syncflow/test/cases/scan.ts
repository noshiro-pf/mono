import { interval, scan, take, type Observable } from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import { type StreamTestCase } from '../typedef';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  scan$: Observable<number>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(10));

  const scan$ = counter$.chain(scan((acc, curr) => acc + curr, 0));

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    scan$,
  };
};

export const scanTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'scan case 1',
    expectedOutput: [0, 0, 1, 3, 6, 10, 15, 21, 28, 36, 45],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, scan$ } = createStreams(tick);
      return getStreamOutputAsPromise(scan$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, scan$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      scan$.subscribe((a) => {
        console.log('scan   ', a);
      });

      startSource();
    },
  },
];
