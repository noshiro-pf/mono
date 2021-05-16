import { timer } from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import type { StreamTestCase } from '../typedef';

export const timerTestCases: [StreamTestCase<number>] = [
  {
    name: 'timer case 1',
    expectedOutput: [0],
    run: (take: number, tick: number): Promise<number[]> => {
      const source$ = timer(tick, true);
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
      const source$ = timer(tick, true);
      source$.subscribe((a) => {
        console.log('timer', a);
      });
      source$.start();
    },
  },
];
