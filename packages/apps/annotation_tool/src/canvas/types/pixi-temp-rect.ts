import { Rect, Rgba } from '@noshiro/ts-utils';
import { Graphics } from 'pixi.js';

export type PixiTempRect = {
  rect: Rect;
  style: {
    borderWidthPx: number;
    borderColor: Rgba;
    faceColor: Rgba;
  };
  pixi: Graphics;
};
