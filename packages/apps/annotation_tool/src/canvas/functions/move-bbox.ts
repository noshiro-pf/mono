import { Point, Rect } from '@noshiro/ts-utils';
import { PixiBbox } from '../types/pixi-bbox';
import { moveRect } from './move-rect';
import { updatePixiBbox } from './update-pixi-bbox';

export const moveBbox = (
  pixiBbox: PixiBbox,
  rectPrevious: Rect,
  from: Point,
  to: Point
): void => {
  updatePixiBbox(pixiBbox, moveRect(rectPrevious, from, to));
};
