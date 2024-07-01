import { type Rect, type Rgba } from '@noshiro/ts-utils-additional';
import { type Graphics } from 'pixi.js-legacy';

export type PixiTempRect = Readonly<{
  rect: Rect;
  style: Readonly<{
    borderWidthPx: number;
    borderColor: Rgba;
    faceColor: Rgba;
  }>;
  pixi: Graphics;
}>;
