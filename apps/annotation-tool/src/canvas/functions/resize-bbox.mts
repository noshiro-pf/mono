import { type Point, type Rect } from 'ts-utils-additional';
import { type PixiBbox } from '../types/index.mjs';
import { type Direction } from './bbox-points.mjs';
import { resizeRect } from './resize-rect.mjs';
import { updatePixiBbox } from './update-pixi-bbox.mjs';

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
