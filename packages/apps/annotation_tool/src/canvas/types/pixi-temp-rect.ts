import { Rect, Rgba } from '@noshiro/ts-utils';
import { Graphics } from 'pixi.js';

export type PixiTempRect = Readonly<{
  rect: Rect;
  style: Readonly<{
    borderWidthPx: number;
    borderColor: Rgba;
    faceColor: Rgba;
  }>;
  pixi: Graphics;
}>;
