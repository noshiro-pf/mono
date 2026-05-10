import { tp } from 'ts-data-forge';
import { type DeepReadonly, type SafeUint } from 'ts-type-forge';
import { counter, map, take, type Observable } from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  doubleWithIndex$: Observable<readonly [number, number]>;
  quad1$: Observable<number>;
  quad2$: Observable<number>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter11$ = counter$.pipe(take(11));

  const doubleWithIndex$ = counter11$.pipe(map((x, i) => tp(i, x * 2)));

  const quad1$ = doubleWithIndex$.pipe(map(([, x]) => x * 2));

  const quad2$ = counter11$.pipe(map((x) => x * 2)).pipe(map((x) => x * 2));

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter11$,
    doubleWithIndex$,
    quad1$,
    quad2$,
  };
};

export const mapTestCases: readonly StreamTestCase<
  readonly [number, number] | number
>[] = [
  {
    name: 'mapWithIndex case 1',
    expectedOutput: [
      [0, 0],
      [1, 2],
      [2, 4],
      [3, 6],
      [4, 8],
      [5, 10],
      [6, 12],
      [7, 14],
      [8, 16],
      [9, 18],
      [10, 20],
    ],
    run: (tick: number): Promise<DeepReadonly<[number, number][]>> => {
      const { startSource, doubleWithIndex$ } = createStreams(tick);

      return getStreamHistoryAsPromise(doubleWithIndex$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, doubleWithIndex$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter        ', a);
      });

      doubleWithIndex$.subscribe((a) => {
        console.log('doubleWithIndex', a);
      });

      startSource();
    },
  },
  {
    name: 'map case 2',
    expectedOutput: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, quad1$ } = createStreams(tick);

      return getStreamHistoryAsPromise(quad1$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, quad1$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });

      quad1$.subscribe((a) => {
        console.log('quad1  ', a);
      });

      startSource();
    },
  },
  {
    name: 'map case 3',
    expectedOutput: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, quad2$ } = createStreams(tick);

      return getStreamHistoryAsPromise(quad2$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, quad2$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });

      quad2$.subscribe((a) => {
        console.log('quad2  ', a);
      });

      startSource();
    },
  },
] as const;

for (const c of mapTestCases) {
  testStream(c);
}
