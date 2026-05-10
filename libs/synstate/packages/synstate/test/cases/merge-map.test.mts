import { ISet } from 'ts-data-forge';
import { type DeepReadonly, type SafeUint } from 'ts-type-forge';
import {
  counter,
  filter,
  map,
  mergeMap,
  take,
  type Observable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

/*
  (tick*1)    0        3     6                         20    23    25 26 28    31

  counter(5)  0                                        4           5
  source      0                                        4           5
  inner 0     0        1     2
  inner 4                                              0     1        2
  inner 5                                                          0     1     2
  mergeMap    (0,0)    (0,1) (0,2)                     (4,0) (4,1) (5,0)(4,2)(5,1) (5,2)
*/
const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  source$: Observable<number>;
  mergeMap$: Observable<readonly [number, number]>;
}> => {
  const sourceValues = ISet.create([0, 4, 5]);

  const counter$ = counter(tick * 5, { startManually: true });

  const counter8$ = counter$.pipe(take(8));

  const source$ = counter8$.pipe(filter((n) => sourceValues.has(n)));

  const mergeMap$ = source$.pipe(
    mergeMap((s) =>
      counter(tick * 3)
        .pipe(take(3))
        .pipe(map((x) => [s, x] as const)),
    ),
  );

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter8$,
    source$,
    mergeMap$,
  };
};

export const mergeMapTestCases: readonly [
  StreamTestCase<readonly [number, number]>,
] = [
  {
    name: 'mergeMap case 1',
    expectedOutput: [
      [0, 0],
      [0, 1],
      [0, 2],
      [4, 0],
      [4, 1],
      [5, 0],
      [4, 2],
      [5, 1],
      [5, 2],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, mergeMap$ } = createStreams(tick);

      return getStreamHistoryAsPromise(mergeMap$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, source$, mergeMap$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter ', a);
      });

      source$.subscribe((a) => {
        console.log('source  ', a);
      });

      mergeMap$.subscribe((a) => {
        console.log('mergeMap', a);
      });

      startSource();
    },
  },
] as const;

for (const c of mergeMapTestCases) {
  testStream(c);
}
