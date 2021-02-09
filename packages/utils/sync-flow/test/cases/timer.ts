import { timer } from '../../src';
import { StreamTestCase } from '../typedef';
import { getStreamOutputAsPromise } from '../utils';

export const timerTestCases: [StreamTestCase<number>] = [
  {
    name: 'timer case 1',
    expectedOutput: [0],
    run: (take: number, tick: number): Promise<number[]> => {
      const source$ = timer(tick, false);
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
      const source$ = timer(tick, false);
      source$.subscribe((a) => {
        console.log('timer', a);
      });
    },
  },
];
