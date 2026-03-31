import { expectType } from 'ts-data-forge';
import {
  combine,
  counter,
  map,
  take,
  timer,
  withInitialValue,
  type InitializedObservable,
  type Observable,
  type TimerObservable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

/*
  Time(ms)              0       200     400     600     800     1000
  Tick                  0   1   2   3   4   5   6   7   8   9   10
  counter               0       1       2       3       4       5
  timer                                         *                   (700ms, tick 7, emits 0)
  timerWithInitialValue -1                      0
  combine1                                      [3,0]   [4,0]   [5,0]
  combine2              [0,-1]  [1,-1]  [2,-1]  [3,-1]  [4,0]   [5,0]
                                                [3,0]
*/

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  timer$: TimerObservable;
  combined1$: Observable<readonly [number, number]>;
  combined2$: Observable<readonly [number, number]>;
}> => {
  const counter$ = counter(tick * 2, { startManually: true });

  const counter6$ = counter$.pipe(take(6));

  const timer$ = timer(tick * 7, { startManually: true });

  const combined1$ = combine([counter6$, timer$]);

  const combined2$ = combine([counter6$, timer$.pipe(withInitialValue(-1))]);

  return {
    startSource: () => {
      timer$.start();

      counter$.start();
    },
    counter$: counter6$,
    timer$,
    combined1$,
    combined2$,
  };
};

export const withInitialValueTestCases: readonly [
  StreamTestCase<readonly [number, number]>,
  StreamTestCase<readonly [number, number]>,
] = [
  {
    name: 'withInitialValue case 1',
    expectedOutput: [
      [3, 0],
      [4, 0],
      [5, 0],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, combined1$ } = createStreams(tick);

      return getStreamHistoryAsPromise(combined1$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, timer$, combined1$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter  ', a);
      });

      timer$.subscribe((a) => {
        console.log('timer    ', a);
      });

      combined1$.subscribe((a) => {
        console.log('combined1', a);
      });

      startSource();
    },
  },
  {
    name: 'withInitialValue case 2',
    expectedOutput: [
      [0, -1],
      [1, -1],
      [2, -1],
      [3, -1],
      [3, 0],
      [4, 0],
      [5, 0],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, combined2$ } = createStreams(tick);

      return getStreamHistoryAsPromise(combined2$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, timer$, combined2$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter  ', a);
      });

      timer$.subscribe((a) => {
        console.log('timer    ', a);
      });

      combined2$.subscribe((a) => {
        console.log('combined2', a);
      });

      startSource();
    },
  },
] as const;

for (const c of withInitialValueTestCases) {
  testStream(c);
}

const s0 = counter(1000).pipe(take(1));

const s1 = s0.pipe(withInitialValue(0));

const s2 = s1.pipe(map((x) => x * 2));

const s3 = s0.pipe(withInitialValue(0)).pipe(map((x) => x * 2));

if (import.meta.vitest !== undefined) {
  test('type-check', () => {
    expectType<typeof s2, InitializedObservable<number>>('=');

    expectType<typeof s3, InitializedObservable<number>>('=');

    expect(s2).toBe(s2);

    expect(s3).toBe(s3);
  });
}
