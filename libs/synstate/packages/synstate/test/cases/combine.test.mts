import { type FixedLengthTuple, type SafeUint } from 'ts-type-forge';
import {
  combine,
  counter,
  filter,
  map,
  take,
  type Observable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import { type StreamTestCase } from '../typedef.mjs';

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
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  double$: Observable<number>;
  quad$: Observable<number>;
  square$: Observable<number>;
  squareEven$: Observable<number>;
  combined$: Observable<FixedLengthTuple<5, number>>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter10$ = counter$.pipe(take(10));

  const double$ = counter10$.pipe(map((x) => x * 2));

  const quad$ = counter10$.pipe(map((x) => x * 2)).pipe(map((x) => x * 2));

  const square$ = counter10$.pipe(map((x) => x ** 2));

  const squareEven$ = square$.pipe(filter((x) => x % 2 === 0));

  const combined$ = combine([counter10$, double$, quad$, square$, squareEven$]);

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter10$,
    double$,
    quad$,
    square$,
    squareEven$,
    combined$,
  };
};

const createStreams2 = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  multiplied$: Observable<number>;
  sum$: Observable<number>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter5$ = counter$.pipe(take(5));

  const multiplied$ = counter5$.pipe(map((x) => 1000 * x));

  const sum$ = combine([counter5$, multiplied$]).pipe(map(([a, b]) => a + b));

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter5$,
    multiplied$,
    sum$,
  };
};

export const combineTestCases: readonly [
  StreamTestCase<FixedLengthTuple<5, number>>,
  StreamTestCase<number>,
] = [
  {
    name: 'combine case 1',
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
    run: (tick: number): Promise<readonly FixedLengthTuple<5, number>[]> => {
      const { startSource, combined$ } = createStreams(tick);

      return getStreamHistoryAsPromise(combined$, startSource);
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
    name: 'combine case 2',
    expectedOutput: [0, 1001, 2002, 3003, 4004],
    run: (tick: number): Promise<readonly number[]> => {
      const { startSource, sum$ } = createStreams2(tick);

      return getStreamHistoryAsPromise(sum$, startSource);
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
] as const;

testStream(combineTestCases[0]);

testStream(combineTestCases[1]);
