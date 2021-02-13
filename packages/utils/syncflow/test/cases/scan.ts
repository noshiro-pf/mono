import { interval, IntervalObservable, Observable, scan } from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  scan$: Observable<number>;
} => {
  const counter$ = interval(tick, true);

  const scan$ = counter$.chain(scan((acc, curr) => acc + curr, 0));

  return { counter$, scan$ };
};

export const scanTestCases: [StreamTestCase<number>] = [
  {
    name: 'scan case 1',
    expectedOutput: [0, 0, 1, 3, 6, 10, 15, 21, 28, 36, 45],
    run: (take: number, tick: number): Promise<number[]> => {
      const { counter$, scan$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        scan$,
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
      const { counter$, scan$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      scan$.subscribe((a) => {
        console.log('scan', a);
      });

      counter$.start();
    },
  },
];
