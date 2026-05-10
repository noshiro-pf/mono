import { ISet } from 'ts-data-forge';
import { type SafeUint } from 'ts-type-forge';
import {
  audit,
  counter,
  filter,
  merge,
  take,
  type Observable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

/*
  (tick)    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0

  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
  filtered  0       2   3                   9   10  11  12  13
            |- 250ms -> |- 250ms ->         |- 250ms -> |- 250ms -> 
  audited             2           3                   11          13
*/
const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  filtered$: Observable<number>;
  audit$: Observable<number>;
  merged$: Observable<number>;
}> => {
  const emitValues = ISet.create([0, 2, 3, 9, 10, 11, 12, 13]);

  const counter$ = counter(tick * 2, { startManually: true });

  const counter23$ = counter$.pipe(take(23));

  const filtered$ = counter23$.pipe(filter((n) => emitValues.has(n)));

  const audit$ = filtered$.pipe(audit(tick * 5));

  const merged$ = merge([filtered$, audit$] as const);

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter23$,
    filtered$,
    audit$,
    merged$,
  };
};

export const auditTestCases: readonly [
  StreamTestCase<number>,
  StreamTestCase<number>,
] = [
  {
    name: 'audit case 1',
    expectedOutput: [2, 3, 11, 13],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, audit$ } = createStreams(tick);

      return getStreamHistoryAsPromise(audit$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, filtered$, audit$ } = createStreams(tick);

      filtered$.subscribe((a) => {
        console.log('filtered ', a);
      });

      audit$.subscribe((a) => {
        console.log('audit', a);
      });

      startSource();
    },
  },
  {
    name: 'audit case 2',
    expectedOutput: [0, 2, 2, 3, 3, 9, 10, 11, 11, 12, 13, 13],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, merged$ } = createStreams(tick);

      return getStreamHistoryAsPromise(merged$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, filtered$, audit$, merged$ } = createStreams(tick);

      filtered$.subscribe((a) => {
        console.log('filtered ', a);
      });

      audit$.subscribe((a) => {
        console.log('audit', a);
      });

      merged$.subscribe((a) => {
        console.log('merged   ', a);
      });

      startSource();
    },
  },
] as const;

for (const c of auditTestCases) {
  testStream(c);
}
