import { Point, Rect } from '@noshiro/ts-utils';
import { PixiBbox } from '../types/pixi-bbox';
import { Direction } from './bbox-points';
import { resizeRect } from './resize-rect';
import { updatePixiBbox } from './update-pixi-bbox';

export const resizeBbox = (
  pixiBbox: PixiBbox,
  rectPrevious: Rect,
  pointDirectionToPinch: Direction,
  from: Point,
  to: Point
): void => {
  updatePixiBbox(
    pixiBbox,
    resizeRect(rectPrevious, pointDirectionToPinch, from, to)
  );
};
