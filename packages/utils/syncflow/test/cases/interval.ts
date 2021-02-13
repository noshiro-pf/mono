import { interval } from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import { StreamTestCase } from '../typedef';

export const intervalTestCases: [StreamTestCase<number>] = [
  {
    name: 'interval case 1',
    expectedOutput: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    run: (take: number, tick: number): Promise<number[]> => {
      const source$ = interval(tick, true);
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
      const source$ = interval(tick, true);
      source$.start().subscribe((a) => {
        console.log('interval', a);
      });
    },
  },
];
