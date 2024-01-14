import {
  filter,
  interval,
  take,
  withBufferedFrom,
  type Observable,
} from '../../src/index.mjs';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

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
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(11));

  const filtered$ = counter$.chain(filter((x) => x % 3 !== 0));
  const sampleInterval$ = interval(tick * 3, true);
  const sampleCounter$ = sampleInterval$.chain(take(5));

  const withBufferedFrom$ = sampleCounter$.chain(withBufferedFrom(filtered$));

  return {
    startSource: () => {
      interval$.start();
      sampleInterval$.start();
    },
    counter$,
    filtered$,
    sampleCounter$,
    withBufferedFrom$,
  };
};

export const withBufferedFromTestCases: readonly [
  StreamTestCase<[number, number[]]>,
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
      return getStreamOutputAsPromise(withBufferedFrom$, startSource);
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
];
