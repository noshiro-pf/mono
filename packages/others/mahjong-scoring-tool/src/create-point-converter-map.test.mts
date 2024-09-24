import { getShuffled } from '@noshiro/ts-utils-additional';
import { createPointMap } from './create-point-converter-map.mjs';
import { type ArrayOfLength4, type Pair } from './types.mjs';
import { sum } from './utils.mjs';

describe('createPointMap', () => {
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
      output: [
        [40_000, 45],
        [30_000, 5],
        [20_000, -15],
        [10_000, -35],
      ],
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
      output: [
        [35_000, 25],
        [20_000, -15],
        [10_000, -35],
      ],
    },
    {
      /**
       * ```txt
       *    [40, 25, 25,  10]
       * -> [10, -5, -5, -20] (subtract oka (30))
       * -> [25, -5, -5, -35] (add uma ([15, (5 - 5)/2, _, -15]))
       * -> [45, -5, -5, -35] (add top bonus (20))
       * ```
       */
      case: '2nd and 3rd are equal',
      input: [40_000, 25_000, 25_000, 10_000],
      output: [
        [40_000, 45],
        [25_000, -5],
        [10_000, -35],
      ],
    },
    {
      /**
       * ```txt
       *    [45, 35,  10,  10]
       * -> [15,  5, -20, -20] (subtract oka (30))
       * -> [30, 10, -30, -30] (add uma ([15, 5, (-5 -15)/2, _]))
       * -> [50, 10, -30, -30] (add top bonus (20))
       * ```
       */
      case: '3rd and 4th are equal',
      input: [45_000, 35_000, 10_000, 10_000],
      output: [
        [45_000, 50],
        [35_000, 10],
        [10_000, -30],
      ],
    },
    {
      /**
       * ```txt
       *    [  30,   30,   30,  10]
       * -> [   0,    0,    0, -20] (subtract oka (30))
       * -> [   5,    5,    5, -35] (add uma ([(15 + 5 + -5) / 3, -15]))
       * -> [11.7, 11.7, 11.7, -35] (add top bonus (20/3))
       * ```
       */
      case: '1,2,3th are equal',
      input: [30_000, 30_000, 30_000, 10_000],
      output: [
        [30_000, 5 + 20 / 3],
        [10_000, -35],
      ],
    },
    {
      /**
       * ```txt
       *    [70,  10,  10,  10]
       * -> [40, -20, -20, -20] (subtract oka (30))
       * -> [55, -25, -25, -25] (add uma ([15, (5 + -5 + -15)/3]))
       * -> [75, -25, -25, -25] (add top bonus (20))
       * ```
       */
      case: '2,3,4th are equal',
      input: [70_000, 10_000, 10_000, 10_000],
      output: [
        [70_000, 75],
        [10_000, -25],
      ],
    },
  ] as const satisfies {
    case: string;
    input: ArrayOfLength4<number>;
    output: Pair[];
  }[])('$case', ({ input, output }) => {
    const result = createPointMap(getShuffled(input), oka, uma);

    expect(sum(input)).toBe(100_000);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(sum(input.map((x) => result.get(x)!))).toBe(0);

    expect(Array.from(result.entries())).toStrictEqual(output);
  });
});
