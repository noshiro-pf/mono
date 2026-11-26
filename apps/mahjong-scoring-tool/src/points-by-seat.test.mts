import { Arr } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import { getShuffled } from 'ts-utils-additional';
import { pointsBySeat } from './points-by-seat.mjs';

describe(pointsBySeat, () => {
  const oka = 30_000;

  const uma = [15, 5, -5, -15] as const;

  test.each([
    {
      /**
       * ```txt
       *    [40, 30,  20,  10]
       * -> [10,  0, -10, -20] (subtract oka (30))
       * -> [25,  5, -15, -35] (add uma ([15, 5, -5, -15]))
       * -> [45,  5, -15, -35] (add top bonus (20))
       * ```
       */
      case: 'mutually distinct case',
      input: [40_000, 30_000, 20_000, 10_000],
      output: [45, 5, -15, -35],
    },
    {
      case: 'each seat keeps its own score, whatever the order',
      input: [20_000, 10_000, 40_000, 30_000],
      output: [-15, -35, 45, 5],
    },
    {
      /**
       * ```txt
       *    [35, 35,  20,  10]
       * -> [ 5,  5, -10, -20] (subtract oka (30))
       * -> [15, 15, -15, -35] (add uma ([(15 + 5) / 2, _, -5, -15]))
       * -> [25, 25, -15, -35] (add top bonus (20 / 2 = 10))
       * ```
       */
      case: '1st and 2nd are equal',
      input: [35_000, 35_000, 20_000, 10_000],
      output: [25, 25, -15, -35],
    },
    {
      case: '2nd and 3rd are equal',
      input: [40_000, 25_000, 25_000, 10_000],
      output: [45, -5, -5, -35],
    },
    {
      case: '3rd and 4th are equal',
      input: [45_000, 35_000, 10_000, 10_000],
      output: [50, 10, -30, -30],
    },
    {
      /**
       * ```txt
       *    [   30,    30,    30,  10]
       * -> [    0,     0,     0, -20] (subtract oka (30))
       * -> [    5,     5,     5, -35] (add uma ([(15 + 5 + -5) / 3, -15]))
       * -> [11.67, 11.67, 11.67, -35] (add top bonus (20 / 3))
       * -> [ 11.7,  11.7,  11.7, -35] (round to 0.1: the sum is 0.1)
       * -> [ 11.6,  11.7,  11.7, -35] (the first top seat takes the -0.1)
       * ```
       */
      case: '1st, 2nd and 3rd are equal: the first of them in seat order takes the remainder',
      input: [30_000, 30_000, 30_000, 10_000],
      output: [11.6, 11.7, 11.7, -35],
    },
    {
      case: 'the remainder goes to the first top seat, not the first seat',
      input: [10_000, 30_000, 30_000, 30_000],
      output: [-35, 11.6, 11.7, 11.7],
    },
    {
      case: '2nd, 3rd and 4th are equal',
      input: [70_000, 10_000, 10_000, 10_000],
      output: [75, -25, -25, -25],
    },
    {
      /**
       * ```txt
       *    [32.2, 23.1,  22.5,  22.2]
       * -> [ 2.2, -6.9,  -7.5,  -7.8] (subtract oka (30))
       * -> [17.2, -1.9, -12.5, -22.8] (add uma ([15, 5, -5, -15]))
       * -> [37.2, -1.9, -12.5, -22.8] (add top bonus (20))
       * ```
       */
      case: 'scores that are not multiples of 1000',
      input: [32_200, 23_100, 22_500, 22_200],
      output: [37.2, -1.9, -12.5, -22.8],
    },
    {
      /**
       * ```txt
       *    [32.25, 23.05,  22.5,  22.2]
       * -> [37.25, -1.95, -12.5, -22.8] (subtract oka, add uma and top bonus)
       * -> [ 37.3,  -2.0, -12.5, -22.8] (round half away from zero)
       * ```
       */
      case: 'a half rounds away from zero, both ways',
      input: [32_250, 23_050, 22_500, 22_200],
      output: [37.3, -2, -12.5, -22.8],
    },
  ] as const satisfies readonly Readonly<{
    case: string;
    input: FixedLengthTuple<4, number>;
    output: FixedLengthTuple<4, number>;
  }>[])('$case', ({ input, output }) => {
    const result = pointsBySeat(input, oka, uma);

    assert.deepStrictEqual(result, output);

    assert.strictEqual(sumInTenths(result), 0);
  });

  test('a seat keeps its score in any seat order', () => {
    const scoreOf = new Map<number, number>([
      [40_000, 45],
      [30_000, 5],
      [20_000, -15],
      [10_000, -35],
    ]);

    const input = getShuffled([40_000, 30_000, 20_000, 10_000] as const);

    assert.deepStrictEqual(
      Array.from(pointsBySeat(input, oka, uma)),
      input.map((p) => scoreOf.get(p)),
    );
  });

  test('a remainder from a tie below the top goes to the top', () => {
    /**
     * ```txt
     *    [55,  15,  15,  15]
     * -> [25, -15, -15, -15] (subtract oka (30))
     * -> [45, -21.67 × 3]    (add uma ([20, (10 - 10 - 20) / 3]))
     * -> [65, -21.7 × 3]     (add top bonus (20); round: the sum is -0.1)
     * -> [65.1, -21.7 × 3]   (the top takes the +0.1)
     * ```
     */
    const result = pointsBySeat(
      [15_000, 55_000, 15_000, 15_000],
      oka,
      [20, 10, -10, -20],
    );

    assert.deepStrictEqual(result, [-21.7, 65.1, -21.7, -21.7]);

    assert.strictEqual(sumInTenths(result), 0);
  });

  test('a score that rounds to zero from below is 0, not -0', () => {
    // 24960: -5.04 + 5 = -0.04, which rounds to 0.
    const result = pointsBySeat([45_000, 24_960, 20_040, 10_000], oka, uma);

    assert.deepStrictEqual(result, [50, 0, -15, -35]);

    assert.isTrue(Object.is(result[1], 0));
  });

  test('the starting stack is the total divided by four, so a 30000 start with a 30000 oka has no top bonus', () => {
    const result = pointsBySeat([45_000, 35_000, 25_000, 15_000], oka, uma);

    assert.deepStrictEqual(result, [30, 10, -10, -30]);

    assert.strictEqual(sumInTenths(result), 0);
  });
});

/** The sum of `points` counted in tenths, which is exact. */
const sumInTenths = (points: readonly number[]): number =>
  Arr.sum(points.map((p) => Math.round(p * 10)));
