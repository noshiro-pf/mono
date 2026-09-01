/* transformer-ignore convert-to-readonly */
//
// PixiJS's scene graph is mutated in place, and so is the canvas's drag state.
// `convert-to-readonly` rewrites these types and every assignment through
// them, which this layer depends on. The `mut_` prefix marks the deliberate
// mutation, as it does elsewhere in the repository.

import { type Percent } from 'ts-type-forge';
import { type Rgba } from 'ts-utils-additional';
import { type BackgroundStyle } from './background-style.mjs';
import {
  defaultBboxStyle,
  fillBboxStyle,
  type BboxStyle,
  type BboxStylePartial,
} from './bbox-style.mjs';

export type AnnotationCanvasStyle = Readonly<{
  background: Readonly<{
    style: BackgroundStyle;
    minPaddingPx: number;
  }>;
  bbox: BboxStyle;
  crosshairLineColor: Rgba;
  crosshairLineWidthPx: number;
  temporaryRectBorderWidthPx: number;
  temporaryRectBorderColor: Rgba;
  temporaryRectFaceColor: Rgba;
  labelSaturation: Percent;
  labelLightness: Percent;
}>;

export type AnnotationCanvasStylePartial = Readonly<{
  background?: Readonly<{
    style?: BackgroundStyle;
    minPaddingPx?: number;
  }>;
  bbox?: BboxStylePartial;
  crosshairLineColor?: Rgba;
  crosshairLineWidthPx?: number;
  temporaryRectBorderWidthPx?: number;
  temporaryRectBorderColor?: Rgba;
  temporaryRectFaceColor?: Rgba;
  labelSaturation?: Percent;
  labelLightness?: Percent;
}>;

export const defaultAnnotationCanvasStyle = {
  background: {
    style: 'checkerboard',
    minPaddingPx: 10,
  },
  bbox: defaultBboxStyle,
  crosshairLineColor: [128, 128, 128, 1],
  crosshairLineWidthPx: 1,
  temporaryRectBorderWidthPx: 1,
  temporaryRectBorderColor: [130, 125, 175, 1],
  temporaryRectFaceColor: [130, 125, 175, 0.5],
  labelSaturation: 80,
  labelLightness: 50,
} as const satisfies AnnotationCanvasStyle;

const dfl = defaultAnnotationCanvasStyle;

export const fillAnnotationCanvasStyle = (
  cs?: AnnotationCanvasStylePartial,
): AnnotationCanvasStyle =>
  ({
    background: {
      style: cs?.background?.style ?? dfl.background.style,
      minPaddingPx: cs?.background?.minPaddingPx ?? dfl.background.minPaddingPx,
    },
    bbox: fillBboxStyle(cs?.bbox),
    crosshairLineColor: cs?.crosshairLineColor ?? dfl.crosshairLineColor,
    crosshairLineWidthPx: cs?.crosshairLineWidthPx ?? dfl.crosshairLineWidthPx,
    temporaryRectBorderWidthPx:
      cs?.temporaryRectBorderWidthPx ?? dfl.temporaryRectBorderWidthPx,
    temporaryRectBorderColor:
      cs?.temporaryRectBorderColor ?? dfl.temporaryRectBorderColor,
    temporaryRectFaceColor:
      cs?.temporaryRectFaceColor ?? dfl.temporaryRectFaceColor,
    labelSaturation: cs?.labelSaturation ?? dfl.labelSaturation,
    labelLightness: cs?.labelLightness ?? dfl.labelLightness,
  }) as const;
