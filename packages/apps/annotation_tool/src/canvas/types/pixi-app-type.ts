import { Application, Sprite } from 'pixi.js';
import { PixiTempRect } from './pixi-temp-rect';

export type PixiApp = {
  app: Application;
  background: Sprite;
  verticalLine: Sprite;
  horizontalLine: Sprite;
  temporaryRect: PixiTempRect;
};
