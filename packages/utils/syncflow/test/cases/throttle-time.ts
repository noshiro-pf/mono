import type { Observable } from '../../src';
import { filter, interval, merge, take, throttleTime } from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import type { StreamTestCase } from '../typedef';

/*
  counter      0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23
  filtered         1   2   3               7       9   10      12  13          16  17  18  19  20
  throttleTime     1                       7           10          13          16          19
*/
const createStreams = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<number>;
  filtered$: Observable<number>;
  throttleTime$: Observable<number>;
  merged$: Observable<number>;
}> => {
  const emitValues = [1, 2, 3, 7, 9, 10, 12, 13, 16, 17, 18, 19, 20];

  const interval$ = interval(tick * 2, true);
  const counter$ = interval$.chain(take(21));

  const filtered$ = counter$.chain(filter((n) => emitValues.includes(n)));
  const throttleTime$ = filtered$.chain(throttleTime(tick * 5));
  const merged$ = merge([filtered$, throttleTime$] as const);

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    filtered$,
    throttleTime$,
    merged$,
  };
};

export const throttleTimeTestCases: readonly [
  StreamTestCase<number>,
  StreamTestCase<number>
] = [
  {
    name: 'throttleTime case 1',
    expectedOutput: [1, 7, 10, 13, 16, 19],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, throttleTime$ } = createStreams(tick);
      return getStreamOutputAsPromise(throttleTime$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, filtered$, throttleTime$ } =
        createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      filtered$.subscribe((a) => {
        console.log('filtered', a);
      });
      throttleTime$.subscribe((a) => {
        console.log('throttleTime', a);
      });

      startSource();
    },
  },
  {
    name: 'throttleTime case 2',
    expectedOutput: [1, 2, 3, 7, 9, 10, 12, 13, 16, 17, 18, 19, 20],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, merged$ } = createStreams(tick);
      return getStreamOutputAsPromise(merged$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, filtered$, throttleTime$, merged$ } =
        createStreams(tick);

      filtered$.subscribe((a) => {
        console.log('filtered', a);
      });
      throttleTime$.subscribe((a) => {
        console.log('throttleTime', a);
      });
      merged$.subscribe((a) => {
        console.log('merged', a);
      });

      startSource();
    },
  },
];
