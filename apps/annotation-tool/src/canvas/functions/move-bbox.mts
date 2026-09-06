import { type Point, type Rect } from 'ts-utils-additional';
import { type PixiBbox } from '../types/index.mjs';
import { moveRect } from './move-rect.mjs';
import { updatePixiBbox } from './update-pixi-bbox.mjs';

export const moveBbox = (
  pixiBbox: PixiBbox,
  rectPrevious: Rect,
  from: Point,
  to: Point,
): void => {
  updatePixiBbox(pixiBbox, moveRect(rectPrevious, from, to));
};
