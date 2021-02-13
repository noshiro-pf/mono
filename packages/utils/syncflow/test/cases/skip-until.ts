import {
  interval,
  IntervalObservable,
  Observable,
  skipUntil,
  timer,
} from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  skip5$: Observable<number>;
} => {
  const counter$ = interval(tick, true);

  const skip5$ = counter$.chain(skipUntil(timer(tick * 5)));

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
