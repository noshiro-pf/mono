import { interval, IntervalObservable, map, Observable } from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import { StreamTestCase } from '../typedef';

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  double$: Observable<number>;
  quad1$: Observable<number>;
  quad2$: Observable<number>;
} => {
  const counter$ = interval(tick, true);

  const double$ = counter$.chain(map((x) => x * 2));
  const quad1$ = double$.chain(map((x) => x * 2));
  const quad2$ = counter$.chain(map((x) => x * 2)).chain(map((x) => x * 2));

  return {
    counter$,
    double$,
    quad1$,
    quad2$,
  };
};

export const mapTestCases: [
  StreamTestCase<number>,
  StreamTestCase<number>,
  StreamTestCase<number>
] = [
  {
    name: 'map case 1',
    expectedOutput: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    run: (take: number, tick: number): Promise<number[]> => {
      const { counter$, double$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        double$,
        take,
        () => {
          counter$.start();
        },
        () => {
          counter$.complete();
        }
      );
    },
    preview: (tick: number): void => {
      const { counter$, double$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      double$.subscribe((a) => {
        console.log('double', a);
      });

      counter$.start();
    },
  },
  {
    name: 'map case 2',
    expectedOutput: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40],
    run: (take: number, tick: number): Promise<number[]> => {
      const { counter$, quad1$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        quad1$,
        take,
        () => {
          counter$.start();
        },
        () => {
          counter$.complete();
        }
      );
    },
    preview: (tick: number): void => {
      const { counter$, quad1$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      quad1$.subscribe((a) => {
        console.log('quad1', a);
      });

      counter$.start();
    },
  },
  {
    name: 'map case 3',
    expectedOutput: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40],
    run: (take: number, tick: number): Promise<number[]> => {
      const { counter$, quad1$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        quad1$,
        take,
        () => {
          counter$.start();
        },
        () => {
          counter$.complete();
        }
      );
    },
    preview: (tick: number): void => {
      const { counter$, quad2$ } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      quad2$.subscribe((a) => {
        console.log('quad2', a);
      });

      counter$.start();
    },
  },
];
