import { interval, IntervalObservable, Observable, take } from '../../src';
import { StreamTestCase } from '../typedef';
import { getStreamOutputAsPromise } from '../utils';

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  take5$: Observable<number>;
} => {
  const counter$ = interval(tick, false);

  const take5$ = counter$.chain(take(5));

  return {
    counter$,
    take5$,
  };
};

export const takeTestCases: [StreamTestCase<number>] = [
  {
    name: 'take case 1',
    expectedOutput: [0, 1, 2, 3, 4],
    run: (take: number, tick: number): Promise<number[]> => {
      const { counter$, take5$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        take5$,
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
      const { counter$, take5$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      take5$.subscribe((a) => {
        console.log('take', a);
      });

      counter$.start();
    },
  },
];
