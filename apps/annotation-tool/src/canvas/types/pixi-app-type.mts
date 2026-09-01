/* transformer-ignore convert-to-readonly */
//
// PixiJS's scene graph is mutated in place, and so is the canvas's drag state.
// `convert-to-readonly` rewrites these types and every assignment through
// them, which this layer depends on. The `mut_` prefix marks the deliberate
// mutation, as it does elsewhere in the repository.

import { type Application, type Sprite } from 'pixi.js-legacy';
import { type PixiTempRect } from './pixi-temp-rect.mjs';

export type PixiApp = Readonly<{
  app: Application;
  background: Sprite;
  verticalLine: Sprite;
  horizontalLine: Sprite;
  temporaryRect: PixiTempRect;
}>;
