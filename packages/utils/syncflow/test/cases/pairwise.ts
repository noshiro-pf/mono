import { interval, IntervalObservable, Observable, pairwise } from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  pairwise$: Observable<[number, number]>;
} => {
  const counter$ = interval(tick, true);

  const pairwise$ = counter$.chain(pairwise());

  return {
    counter$,
    pairwise$,
  };
};

export const pairwiseTestCases: [StreamTestCase<[number, number]>] = [
  {
    name: 'pairwise case 1',
    expectedOutput: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
    run: (take: number, tick: number): Promise<[number, number][]> => {
      const { counter$, pairwise$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        pairwise$,
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
      const { counter$, pairwise$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      pairwise$.subscribe((a) => {
        console.log('pairwise', a);
      });

      counter$.start();
    },
  },
];
