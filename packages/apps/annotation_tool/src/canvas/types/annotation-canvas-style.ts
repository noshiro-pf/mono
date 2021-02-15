import { Percent, Rgba } from '@noshiro/ts-utils';
import { BackgroundStyle } from './background-style';
import {
  BboxStyle,
  BboxStylePartial,
  defaultBboxStyle,
  fillBboxStyle,
} from './bbox-style';

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

export const defaultAnnotationCanvasStyle: AnnotationCanvasStyle = {
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
} as const;

const dfl = defaultAnnotationCanvasStyle;

export const fillAnnotationCanvasStyle = (
  cs?: AnnotationCanvasStylePartial
): AnnotationCanvasStyle => ({
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
});
