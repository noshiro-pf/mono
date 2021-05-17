import type { IntervalObservable, Observable } from '../../src';
import { combineLatest, filter, interval, map } from '../../src';
import { getStreamOutputAsPromise } from '../get-strem-output-as-promise';
import type { StreamTestCase } from '../typedef';

/*
 *  [      counter      ]
 *    |           |
 *    |           |
 * [double]    [square]
 *    |  \        |  \
 *    | [quad]    | [squareEven]
 *    |     |     |     |
 *    |     |     |     |
 *  [      combined       ]
 */

const createStreams = (
  tick: number
): {
  counter$: IntervalObservable;
  double$: Observable<number>;
  quad$: Observable<number>;
  square$: Observable<number>;
  squareEven$: Observable<number>;
  combined$: Observable<[number, number, number, number, number]>;
} => {
  const counter$ = interval(tick, true);

  const double$ = counter$.chain(map((x) => x * 2));
  const quad$ = counter$.chain(map((x) => x * 2)).chain(map((x) => x * 2));
  const square$ = counter$.chain(map((x) => x * x));
  const squareEven$ = square$.chain(filter((x) => x % 2 === 0));
  const combined$ = combineLatest(
    counter$,
    double$,
    quad$,
    square$,
    squareEven$
  );

  return {
    counter$,
    double$,
    quad$,
    square$,
    squareEven$,
    combined$,
  };
};

const createStreams2 = (
  tick: number
): {
  counter$: IntervalObservable;
  multiplied$: Observable<number>;
  sum$: Observable<number>;
} => {
  const counter$ = interval(tick, true);
  const multiplied$ = counter$.chain(map((x) => 1000 * x));
  const sum$ = combineLatest(counter$, multiplied$).chain(
    map(([a, b]) => a + b)
  );

  return {
    counter$,
    multiplied$,
    sum$,
  };
};

export const combineLatestTestCases: [
  StreamTestCase<[number, number, number, number, number]>,
  StreamTestCase<number>
] = [
  {
    name: 'combineLatest case 1',
    expectedOutput: [
      [0, 0, 0, 0, 0],
      [1, 2, 4, 1, 0],
      [2, 4, 8, 4, 4],
      [3, 6, 12, 9, 4],
      [4, 8, 16, 16, 16],
      [5, 10, 20, 25, 16],
      [6, 12, 24, 36, 36],
      [7, 14, 28, 49, 36],
      [8, 16, 32, 64, 64],
      [9, 18, 36, 81, 64],
    ],
    run: (
      take: number,
      tick: number
    ): Promise<[number, number, number, number, number][]> => {
      const { counter$, combined$ } = createStreams(tick);
      return getStreamOutputAsPromise(
        combined$,
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
      const { counter$, double$, quad$, square$, squareEven$, combined$ } =
        createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      double$.subscribe((a) => {
        console.log('double', a);
      });
      quad$.subscribe((a) => {
        console.log('quad', a);
      });
      square$.subscribe((a) => {
        console.log('square', a);
      });
      squareEven$.subscribe((a) => {
        console.log('squareEven', a);
      });
      combined$.subscribe((a) => {
        console.log('combined', a);
      });

      counter$.start();
    },
  },
  {
    name: 'combineLatest case 2',
    expectedOutput: [0, 1001, 2002, 3003, 4004],
    run: (take: number, tick: number): Promise<number[]> => {
      const { counter$, sum$ } = createStreams2(tick);
      return getStreamOutputAsPromise(
        sum$,
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
      const { counter$, sum$ } = createStreams2(tick);

      sum$.subscribe((a) => {
        console.log('sum', a);
      });

      counter$.start();
    },
  },
];
