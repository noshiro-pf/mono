import { interval, map, take, type Observable } from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { type StreamTestCase } from '../typedef.mjs';

const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  double$: Observable<number>;
  quad1$: Observable<number>;
  quad2$: Observable<number>;
}> => {
  const interval$ = interval(tick, true);

  const counter$ = interval$.pipe(take(11));

  const double$ = counter$.pipe(map((x) => x * 2));

  const quad1$ = double$.pipe(map((x) => x * 2));

  const quad2$ = counter$.pipe(map((x) => x * 2)).pipe(map((x) => x * 2));

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    double$,
    quad1$,
    quad2$,
  };
};

export const mapTestCases: readonly [
  StreamTestCase<number>,
  StreamTestCase<number>,
  StreamTestCase<number>,
] = [
  {
    name: 'map case 1',
    expectedOutput: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, double$ } = createStreams(tick);

      return getStreamHistoryAsPromise(double$, () => {
        startSource();
      });
    },
    preview: (tick: number): void => {
      const { startSource, counter$, double$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });

      double$.subscribe((a) => {
        console.log('double ', a);
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
];
