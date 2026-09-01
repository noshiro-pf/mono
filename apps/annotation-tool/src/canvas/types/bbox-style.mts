/* transformer-ignore convert-to-readonly */
//
// PixiJS's scene graph is mutated in place, and so is the canvas's drag state.
// `convert-to-readonly` rewrites these types and every assignment through
// them, which this layer depends on. The `mut_` prefix marks the deliberate
// mutation, as it does elsewhere in the repository.

import { type Percent } from 'ts-type-forge';
import { type Alpha } from 'ts-utils-additional';

export type BboxStyle = Readonly<{
  pointWidthPx: number;
  borderWidthPx: Readonly<{
    notSelected: number;
    selected: number;
  }>;
  borderColorSLA: Readonly<{
    // [Saturation, Lightness, Alpha]
    // Alpha is a transparency value (0.00 to 1.00)
    notSelected: readonly [Percent, Percent, Alpha];
    selected: readonly [Percent, Percent, Alpha];
  }>;
  // [Saturation, Lightness, Alpha]
  // Alpha is a transparency value (0.00 to 1.00)
  highlightedFaceColorSLA: readonly [Percent, Percent, Alpha];
  borderDashLengthPx: number;
}>;

export type BboxStylePartial = Partial<BboxStyle>;

export const defaultBboxStyle = {
  pointWidthPx: 8,
  borderWidthPx: {
    notSelected: 2,
    selected: 3,
  },
  borderColorSLA: {
    notSelected: [80, 50, 1],
    selected: [100, 80, 1],
  },
  highlightedFaceColorSLA: [80, 50, 0.4],
  borderDashLengthPx: 5,
} as const satisfies BboxStyle;

const dfl = defaultBboxStyle;

export const fillBboxStyle = (bs?: BboxStylePartial): BboxStyle =>
  ({
    pointWidthPx: bs?.pointWidthPx ?? dfl.pointWidthPx,
    borderWidthPx: bs?.borderWidthPx ?? dfl.borderWidthPx,
    borderColorSLA: bs?.borderColorSLA ?? dfl.borderColorSLA,
    highlightedFaceColorSLA:
      bs?.highlightedFaceColorSLA ?? dfl.highlightedFaceColorSLA,
    borderDashLengthPx: bs?.borderDashLengthPx ?? dfl.borderDashLengthPx,
  }) as const;
