import { interval } from '../../src/create';
import { StreamTestCase } from '../typedef';
import { getStreamOutputAsPromise } from '../utils';

export const intervalTestCases: StreamTestCase<number>[] = [
  {
    name: 'interval case 1',
    numTakeDefault: 10,
    run: (take: number, tick: number): Promise<number[]> => {
      const source$ = interval(tick);
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
      const source$ = interval(tick);
      source$.subscribe((a) => console.log('interval', a));
    },
  },
];
