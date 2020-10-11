import type { Sprite } from 'pixi.js';
import type { PixiTempRect } from './pixi-temp-rect';

export type PixiGlobalObjects = Readonly<{
  background: Sprite;
  verticalLine: Sprite;
  horizontalLine: Sprite;
  temporaryRect: PixiTempRect;
}>;
