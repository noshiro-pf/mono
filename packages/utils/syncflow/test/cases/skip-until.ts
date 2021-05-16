import type { IntervalObservable, Observable } from '../../src';
import { interval, skipUntil, timer } from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import type { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  skip5$: Observable<number>;
} => {
  const counter$ = interval(tick * 2, true);

  const skip5$ = counter$.chain(skipUntil(timer(tick * 9)));

  return {
    counter$,
    skip5$,
  };
};

export const skipUntilTestCases: [StreamTestCase<number>] = [
  {
    name: 'skipUntil case 1',
    expectedOutput: [4, 5, 6, 7, 8],
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
