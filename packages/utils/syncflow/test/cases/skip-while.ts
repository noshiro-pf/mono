import { interval, IntervalObservable, Observable, skipWhile } from '../../src';
import { StreamTestCase } from '../typedef';
import { getStreamOutputAsPromise } from '../utils';

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  skip5$: Observable<number>;
} => {
  const counter$ = interval(tick, false);

  const skip5$ = counter$.chain(skipWhile((i) => i < 5));

  return {
    counter$,
    skip5$,
  };
};

export const skipWhileTestCases: [StreamTestCase<number>] = [
  {
    name: 'skipWhile case 1',
    expectedOutput: [5, 6, 7, 8, 9],
    run: (take: number, tick: number): Promise<number[]> => {
      const { counter$, skip5$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        skip5$,
        take,
        () => {
          counter$.start();
        },
        () => {
          counter$.complete();
        }
      );
    },
    preview: (tick: number): void => {
      const { counter$, skip5$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      skip5$.subscribe((a) => {
        console.log('skip', a);
      });

      counter$.start();
    },
  },
];
