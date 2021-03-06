import type { IntervalObservable, Observable } from '../../src';
import { interval, map, withLatestFrom } from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import type { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  withLatest$: Observable<[number, number]>;
} => {
  const counter$ = interval(tick, true);
  const double$ = counter$.chain(map((x) => x * 2));

  const withLatest$ = counter$.chain(withLatestFrom(double$));

  return {
    counter$,
    withLatest$,
  };
};

export const withLatestFromTestCases: [StreamTestCase<[number, number]>] = [
  {
    name: 'withLatestFrom case 1',
    expectedOutput: [
      [0, 0],
      [1, 2],
      [2, 4],
      [3, 6],
      [4, 8],
      [5, 10],
      [6, 12],
      [7, 14],
      [8, 16],
      [9, 18],
      [10, 20],
    ],
    run: (take: number, tick: number): Promise<[number, number][]> => {
      const { counter$, withLatest$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        withLatest$,
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
      const { counter$, withLatest$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      withLatest$.subscribe((a) => {
        console.log('withLatest', a);
      });

      counter$.start();
    },
  },
];
