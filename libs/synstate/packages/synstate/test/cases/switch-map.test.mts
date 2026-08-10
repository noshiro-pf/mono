import { ISet } from 'ts-data-forge';
import { type FixedLengthTuple, type SafeUint } from 'ts-type-forge';
import {
  counter,
  filter,
  map,
  switchMap,
  take,
  type Observable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

/*
  (tick*1)    0        3     6                         20    23    25    28    31

  counter(5)  0                                        4           5
  source      0                                        4           5
  inner 0     0        1     2
  inner 4                                              0     1     (switch!)
  inner 5                                                          0     1     2
  switchMap   (0,0)    (0,1) (0,2)                     (4,0) (4,1) (5,0) (5,1) (5,2)
*/
const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  source$: Observable<number>;
  switchMap$: Observable<FixedLengthTuple<2, number>>;
}> => {
  const sourceValues = ISet.create([0, 4, 5]);

  const counter$ = counter(tick * 5, { startManually: true });

  const counter8$ = counter$.pipe(take(8));

  const source$ = counter8$.pipe(filter((n) => sourceValues.has(n)));

  const switchMap$ = source$.pipe(
    switchMap((s) =>
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
    switchMap$,
  };
};

export const switchMapTestCases: readonly [
  StreamTestCase<FixedLengthTuple<2, number>>,
] = [
  {
    name: 'switchMap case 1',
    expectedOutput: [
      [0, 0],
      [0, 1],
      [0, 2],
      [4, 0],
      [4, 1],
      [5, 0],
      [5, 1],
      [5, 2],
    ],
    run: (tick: number): Promise<readonly FixedLengthTuple<2, number>[]> => {
      const { startSource, switchMap$ } = createStreams(tick);

      return getStreamHistoryAsPromise(switchMap$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, source$, switchMap$ } =
        createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter  ', a);
      });

      source$.subscribe((a) => {
        console.log('source   ', a);
      });

      switchMap$.subscribe((a) => {
        console.log('switchMap', a);
      });

      startSource();
    },
  },
] as const;

for (const c of switchMapTestCases) {
  testStream(c);
}
