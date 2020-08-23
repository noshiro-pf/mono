import { timer } from '../../src/create';
import { StreamTestCase } from '../typedef';
import { getStreamOutputAsPromise } from '../utils';

export const timerTestCases: StreamTestCase<number>[] = [
  {
    name: 'timer case 1',
    numTakeDefault: 1,
    run: (take: number, tick: number): Promise<number[]> => {
      const source$ = timer(tick);
      return getStreamOutputAsPromise(
        source$,
        take,
        () => {
          source$.start();
        },
        () => {
          source$.stop();
        }
      );
    },
    preview: (tick: number): void => {
      const source$ = timer(tick);
      source$.subscribe((a) => console.log('timer', a));
    },
  },
];
