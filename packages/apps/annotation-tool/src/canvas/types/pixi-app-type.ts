import { type Application, type Sprite } from 'pixi.js';
import { type PixiTempRect } from './pixi-temp-rect';

export type PixiApp = Readonly<{
  app: Application;
  background: Sprite;
  verticalLine: Sprite;
  horizontalLine: Sprite;
  temporaryRect: PixiTempRect;
}>;
