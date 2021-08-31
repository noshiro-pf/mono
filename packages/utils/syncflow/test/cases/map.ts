import type { Observable } from '../../src';
import { interval, map, take } from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import type { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): Readonly<{
  startSource: () => void;
  counter$: Observable<number>;
  double$: Observable<number>;
  quad1$: Observable<number>;
  quad2$: Observable<number>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(11));

  const double$ = counter$.chain(map((x) => x * 2));
  const quad1$ = double$.chain(map((x) => x * 2));
  const quad2$ = counter$.chain(map((x) => x * 2)).chain(map((x) => x * 2));

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
  StreamTestCase<number>
] = [
  {
    name: 'map case 1',
    expectedOutput: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, double$ } = createStreams(tick);
      return getStreamOutputAsPromise(double$, () => {
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
      return getStreamOutputAsPromise(quad1$, startSource);
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
      const { startSource, quad1$ } = createStreams(tick);
      return getStreamOutputAsPromise(quad1$, startSource);
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
