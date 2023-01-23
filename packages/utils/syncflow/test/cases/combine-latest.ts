import {
  combineLatest,
  filter,
  interval,
  map,
  take,
  type Observable,
} from '../../src';
import { getStreamOutputAsPromise } from '../get-stream-output-as-promise';
import { type StreamTestCase } from '../typedef';

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
): Readonly<{
  startSource: () => void;
  counter$: Observable<number>;
  double$: Observable<number>;
  quad$: Observable<number>;
  square$: Observable<number>;
  squareEven$: Observable<number>;
  combined$: Observable<readonly [number, number, number, number, number]>;
}> => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(10));

  const double$ = counter$.chain(map((x) => x * 2));
  const quad$ = counter$.chain(map((x) => x * 2)).chain(map((x) => x * 2));
  const square$ = counter$.chain(map((x) => x * x));
  const squareEven$ = square$.chain(filter((x) => x % 2 === 0));
  const combined$ = combineLatest([
    counter$,
    double$,
    quad$,
    square$,
    squareEven$,
  ] as const);

  return {
    startSource: () => {
      interval$.start();
    },
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
  startSource: () => void;
  counter$: Observable<number>;
  multiplied$: Observable<number>;
  sum$: Observable<number>;
} => {
  const interval$ = interval(tick, true);
  const counter$ = interval$.chain(take(5));

  const multiplied$ = counter$.chain(map((x) => 1000 * x));
  const sum$ = combineLatest([counter$, multiplied$] as const).chain(
    map(([a, b]) => a + b)
  );

  return {
    startSource: () => {
      interval$.start();
    },
    counter$,
    multiplied$,
    sum$,
  };
};

export const combineLatestTestCases: readonly [
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
      tick: number
    ): Promise<DeepReadonly<[number, number, number, number, number][]>> => {
      const { startSource, combined$ } = createStreams(tick);
      return getStreamOutputAsPromise(combined$, startSource);
    },
    preview: (tick: number): void => {
      const {
        startSource,
        counter$,
        double$,
        quad$,
        square$,
        squareEven$,
        combined$,
      } = createStreams(tick);

      counter$.subscribe((a) => {
        console.log('counter   ', a);
      });
      double$.subscribe((a) => {
        console.log('double    ', a);
      });
      quad$.subscribe((a) => {
        console.log('quad      ', a);
      });
      square$.subscribe((a) => {
        console.log('square    ', a);
      });
      squareEven$.subscribe((a) => {
        console.log('squareEven', a);
      });
      combined$.subscribe((a) => {
        console.log('combined  ', a);
      });

      startSource();
    },
  },
  {
    name: 'combineLatest case 2',
    expectedOutput: [0, 1001, 2002, 3003, 4004],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, sum$ } = createStreams2(tick);
      return getStreamOutputAsPromise(sum$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, counter$, sum$ } = createStreams2(tick);

      counter$.subscribe((a) => {
        console.log('counter', a);
      });
      sum$.subscribe((a) => {
        console.log('sum    ', a);
      });

      startSource();
    },
  },
];
