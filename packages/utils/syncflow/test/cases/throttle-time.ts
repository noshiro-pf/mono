import {
  filter,
  interval,
  IntervalObservable,
  merge,
  Observable,
  throttleTime,
} from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import { StreamTestCase } from '../typedef';

/*
  counter      0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23
  filtered         1   2   3               7       9   10      12  13          16  17  18  19  20
  throttleTime     1                       7           10          13          16
*/
const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  filtered$: Observable<number>;
  throttleTime$: Observable<number>;
  merged$: Observable<number>;
} => {
  const emitValues = [1, 2, 3, 7, 9, 10, 12, 13, 16, 17, 18, 19, 20];
  const counter$ = interval(tick * 2, true);
  const filtered$ = counter$.chain(filter((n) => emitValues.includes(n)));
  const throttleTime$ = filtered$.chain(throttleTime(tick * 5));
  const merged$ = merge(filtered$, throttleTime$);
  return {
    counter$,
    filtered$,
    throttleTime$,
    merged$,
  };
};

export const throttleTimeTestCases: [
  StreamTestCase<number>,
  StreamTestCase<number>
] = [
  {
    name: 'throttleTime case 1',
    expectedOutput: [1, 7, 10, 13, 16],
    run: (take: number, tick: number): Promise<number[]> => {
      const { counter$, throttleTime$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        throttleTime$,
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
      const { counter$, filtered$, throttleTime$ } = createStreams(tick);

      filtered$.subscribe((a) => {
        console.log('filtered', a);
      });
      throttleTime$.subscribe((a) => {
        console.log('throttleTime', a);
      });

      counter$.start();
    },
  },
  {
    name: 'throttleTime case 2',
    expectedOutput: [1, 2, 3, 7, 9, 10, 12, 13, 16, 17, 18, 19, 20],
    run: (take: number, tick: number): Promise<number[]> => {
      const { counter$, merged$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        merged$,
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
      const { counter$, filtered$, throttleTime$, merged$ } = createStreams(
        tick
      );

      filtered$.subscribe((a) => {
        console.log('filtered', a);
      });
      throttleTime$.subscribe((a) => {
        console.log('throttleTime', a);
      });
      merged$.subscribe((a) => {
        console.log('merged', a);
      });

      counter$.start();
    },
  },
];
