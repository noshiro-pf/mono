import { interval, take, type Observable } from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import { type StreamTestCase } from '../typedef';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  take5$: Observable<number>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(10));

  const take5$ = counter$.chain(take(5));

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    take5$,
  };
};

export const takeTestCases: readonly [StreamTestCase<number>] = [
  {
    name: 'take case 1',
    expectedOutput: [0, 1, 2, 3, 4],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, take5$ } = createStreams(tick);
      return getStreamOutputAsPromise(take5$, startSource);
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
];
