import { type Point, type Rect } from '@noshiro/ts-utils-additional';
import { type PixiBbox } from '../types';
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
