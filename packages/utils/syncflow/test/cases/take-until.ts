import {
  interval,
  IntervalObservable,
  Observable,
  takeUntil,
  timer,
} from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  take5$: Observable<number>;
} => {
  const counter$ = interval(tick * 2, true);

  const take5$ = counter$.chain(takeUntil(timer(tick * 9)));

  return {
    counter$,
    take5$,
  };
};

export const takeUntilTestCases: [StreamTestCase<number>] = [
  {
    name: 'takeUntil case 1',
    expectedOutput: [0, 1, 2, 3],
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
