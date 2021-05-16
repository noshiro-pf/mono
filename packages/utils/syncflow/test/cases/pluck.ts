import type { IntervalObservable, Observable } from '../../src';
import { interval, map, pluck } from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import type { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  pluck$: Observable<string>;
} => {
  const counter$ = interval(tick, true);

  const pluck$ = counter$
    .chain(map((i) => ({ x: i.toString() })))
    .chain(pluck('x'));

  return {
    counter$,
    pluck$,
  };
};

export const pluckTestCases: [StreamTestCase<string>] = [
  {
    name: 'pluck case 1',
    expectedOutput: ['0', '1', '2', '3', '4'],
    run: (take: number, tick: number): Promise<string[]> => {
      const { counter$, pluck$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        pluck$,
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
      const { counter$, pluck$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      pluck$.subscribe((a) => {
        console.log('pluck', a);
      });

      counter$.start();
    },
  },
];
