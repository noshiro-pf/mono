import { interval } from '../../src';
import { StreamTestCase } from '../typedef';
import { getStreamOutputAsPromise } from '../utils';

export const intervalTestCases: [StreamTestCase<number>] = [
  {
    name: 'interval case 1',
    expectedOutput: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    run: (take: number, tick: number): Promise<number[]> => {
      const source$ = interval(tick, false);
      return getStreamOutputAsPromise(
        source$,
        take,
        () => {
          source$.start();
        },
        () => {
          source$.complete();
        }
      );
    },
    preview: (tick: number): void => {
      const source$ = interval(tick, false);
      source$.start().subscribe((a) => {
        console.log('interval', a);
      });
    },
  },
];
