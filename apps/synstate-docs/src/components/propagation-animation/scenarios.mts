import type { Evaluation, Scenario } from './scenario.mjs';

/** `B = A × 10`, `C = A × 1000`, `D = combine([B, C]).pipe(map(sum))` */
export const diamondScenario: Scenario = {
  initialValue: 0,
  inputs: [1],
  nodes: [
    { id: 'A', depth: 0, parents: [], x: 470, valuesSide: 'right' },
    {
      id: 'B',
      depth: 1,
      parents: ['A'],
      x: 330,
      valuesSide: 'right',
      op: { text: 'map(x => x * 10)', x: 360, y: 125 },
      evaluate: ([a = 0]) => times(a, 10),
    },
    {
      id: 'C',
      depth: 1,
      parents: ['A'],
      x: 610,
      valuesSide: 'right',
      op: { text: 'map(x => x * 1000)', x: 600, y: 125 },
      evaluate: ([a = 0]) => times(a, 1000),
    },
    {
      id: 'D',
      depth: 2,
      parents: ['B', 'C'],
      x: 470,
      valuesSide: 'right',
      op: { text: 'combine([B, C]).pipe(map(sum))', x: 470, y: 265 },
      evaluate: ([b = 0, c = 0]) => sum(b, c),
    },
  ],
} as const;

/** The diamond run for three inputs, to show RxJS's glitches repeat. */
export const rxjsDiamondScenario: Scenario = {
  ...diamondScenario,
  inputs: [1, 2, 3],
} as const;

/**
 * `B = A × 10`, `D = A | filter(isEven)`, `C = combine([B, D]).pipe(map(sum))`,
 * `E = D × 10`, created in that order, as on the page.
 */
export const filterDiamondScenario: Scenario = {
  initialValue: 0,
  inputs: [1, 2],
  nodes: [
    { id: 'A', depth: 0, parents: [], x: 470, valuesSide: 'right' },
    {
      id: 'B',
      depth: 1,
      parents: ['A'],
      x: 330,
      valuesSide: 'right',
      op: { text: 'map(×10)', x: 375, y: 125 },
      evaluate: ([a = 0]) => times(a, 10),
    },
    {
      id: 'D',
      depth: 1,
      parents: ['A'],
      x: 610,
      valuesSide: 'right',
      op: { text: 'filter(isEven)', x: 575, y: 125 },
      evaluate: ([a = 0]) =>
        a % 2 === 0
          ? ({
              type: 'emit',
              value: a,
              formula: `isEven(${a.toString()}) = true`,
            } as const)
          : ({
              type: 'skip',
              reason: {
                en: `${a.toString()} is odd, so filter rejects it.`,
                ja: `${a.toString()} は奇数なので filter が通しません。`,
              },
            } as const),
    },
    {
      id: 'C',
      depth: 2,
      parents: ['B', 'D'],
      x: 470,
      valuesSide: 'left',
      op: { text: 'combine([B, D]).pipe(map(sum))', x: 470, y: 265 },
      evaluate: ([b = 0, d = 0]) => sum(b, d),
    },
    {
      id: 'E',
      depth: 2,
      parents: ['D'],
      x: 730,
      valuesSide: 'right',
      op: { text: 'map(×10)', x: 700, y: 265 },
      evaluate: ([d = 0]) => times(d, 10),
    },
  ],
} as const;

const times = (a: number, k: number): Evaluation =>
  ({
    type: 'emit',
    value: a * k,
    formula: `${a.toString()} × ${k.toString()} = ${(a * k).toString()}`,
  }) as const;

const sum = (a: number, b: number): Evaluation =>
  ({
    type: 'emit',
    value: a + b,
    formula: `${a.toString()} + ${b.toString()} = ${(a + b).toString()}`,
  }) as const;
