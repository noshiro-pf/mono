import { type Point, type Rect } from '@noshiro/ts-utils-additional';
import { type PixiBbox } from '../types';
import { type Direction } from './bbox-points';
import { resizeRect } from './resize-rect';
import { updatePixiBbox } from './update-pixi-bbox';

export const resizeBbox = (
  pixiBbox: PixiBbox,
  rectPrevious: Rect,
  pointDirectionToPinch: Direction,
  from: Point,
  to: Point,
): void => {
  updatePixiBbox(
    pixiBbox,
    resizeRect(rectPrevious, pointDirectionToPinch, from, to),
  );
};
