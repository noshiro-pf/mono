import {
  counter,
  filter,
  take,
  withBufferedFrom,
  type Observable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';
import { withCurrentValueFromTestCases } from './with-current-value-from.test.mjs';

/*
  (tick)            0   1   2   3   4   5   6   7   8   9   10
  counter           0   1   2   3   4   5   6   7   8   9   10
  filtered              1   2       4   5       7   8       10
  sampleCounter     0           1           2           3           4
  withBufferedFrom
*/

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  filtered$: Observable<number>;
  sampleCounter$: Observable<number>;
  withBufferedFrom$: Observable<DeepReadonly<[number, number[]]>>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter11$ = counter$.pipe(take(11));

  const filtered$ = counter11$.pipe(filter((x) => x % 3 !== 0));

  const sampleCounter$ = counter(tick * 3, { startManually: true });

  const sampleCounter5$ = sampleCounter$.pipe(take(5));

  const withBufferedFrom$ = sampleCounter5$.pipe(withBufferedFrom(filtered$));

  return {
    startSource: () => {
      counter$.start();

      sampleCounter$.start();
    },
    counter$: counter11$,
    filtered$,
    sampleCounter$: sampleCounter5$,
    withBufferedFrom$,
  };
};

export const withBufferedFromTestCases: readonly [
  StreamTestCase<readonly [number, readonly number[]]>,
] = [
  {
    name: 'withBufferedFrom case 1',
    expectedOutput: [
      [0, []],
      [1, [1, 2]],
      [2, [4, 5]],
      [3, [7, 8]],
      [4, [10]],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number[]][]>> => {
      const { startSource, withBufferedFrom$ } = createStreams(tick);

      return getStreamHistoryAsPromise(withBufferedFrom$, startSource);
    },
    preview: (tick: number): void => {
      const {
        startSource,
        counter$,
        filtered$,
        sampleCounter$,
        withBufferedFrom$,
      } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter          ', a);
      });

      filtered$.subscribe((a) => {
        console.log('filtered         ', a);
      });

      sampleCounter$.subscribe((a) => {
        console.log('sampleCounter    ', a);
      });

      withBufferedFrom$.subscribe((a) => {
        console.log('withBufferedFrom ', a);
      });

      startSource();
    },
  },
] as const;

for (const c of withCurrentValueFromTestCases) {
  testStream(c);
}
