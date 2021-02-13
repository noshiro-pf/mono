import {
  interval,
  IntervalObservable,
  map,
  Observable,
  withIndex,
} from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  doubleWithIndex$: Observable<[number, number]>;
} => {
  const counter$ = interval(tick, true);

  const doubleWithIndex$ = counter$.chain(map((x) => x * 2)).chain(withIndex());

  return {
    counter$,
    doubleWithIndex$,
  };
};

export const withIndexTestCases: [StreamTestCase<[number, number]>] = [
  {
    name: 'withIndex case 1',
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
      const { counter$, doubleWithIndex$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        doubleWithIndex$,
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
      const { counter$, doubleWithIndex$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      doubleWithIndex$.subscribe((a) => {
        console.log('doubleWithIndex', a);
      });

      counter$.start();
    },
  },
];
