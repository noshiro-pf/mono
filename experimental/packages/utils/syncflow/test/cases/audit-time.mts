import { ISet } from '@noshiro/ts-utils';
import {
  auditTime,
  filter,
  interval,
  merge,
  take,
  type Observable,
} from '../../src/index.mjs';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

/*
  (tick)    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9

  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23
  filtered      1       3   4                       10          13          16  17  18  19  20
  auditTime               3           4                       10          13          18          20
*/
const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  filtered$: Observable<number>;
  auditTime$: Observable<number>;
  merged$: Observable<number>;
}> => {
  const emitValues = ISet.new([1, 3, 4, 10, 13, 16, 17, 18, 19, 20]);

  const interval$ = interval(tick * 2, true);
  const counter$ = interval$.chain(take(23));

  const filtered$ = counter$.chain(filter((n) => emitValues.has(n)));
  const auditTime$ = filtered$.chain(auditTime(tick * 5));
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const merged$ = merge([filtered$, auditTime$] as const);

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    filtered$,
    auditTime$,
    merged$,
  };
};

export const auditTimeTestCases: readonly [
  StreamTestCase<number>,
  StreamTestCase<number>,
] = [
  {
    name: 'auditTime case 1',
    expectedOutput: [3, 4, 10, 13, 18, 20],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, auditTime$ } = createStreams(tick);
      return getStreamOutputAsPromise(auditTime$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, filtered$, auditTime$ } = createStreams(tick);

      filtered$.subscribe((a) => {
        console.log('filtered ', a);
      });
      auditTime$.subscribe((a) => {
        console.log('auditTime', a);
      });

      startSource();
    },
  },
  {
    name: 'auditTime case 2',
    expectedOutput: [1, 3, 3, 4, 4, 10, 10, 13, 13, 16, 17, 18, 18, 19, 20, 20],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, merged$ } = createStreams(tick);
      return getStreamOutputAsPromise(merged$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, filtered$, auditTime$, merged$ } =
        createStreams(tick);

      filtered$.subscribe((a) => {
        console.log('filtered ', a);
      });
      auditTime$.subscribe((a) => {
        console.log('auditTime', a);
      });
      merged$.subscribe((a) => {
        console.log('merged   ', a);
      });

      startSource();
    },
  },
];
