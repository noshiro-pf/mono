import type { Point, Rect, Rgba } from '@noshiro/ts-utils';
import type { Graphics } from 'pixi.js';
import { Rectangle } from 'pixi.js';
import type { PixiBbox } from '../types';
import type { Direction } from './bbox-points';
import { updateRectangleGraphics } from './create-pixi-object';

export const updateBboxPoint = (
  point: Graphics,
  x: number,
  y: number,
  pointWidthPxHalf: number,
  color: Rgba
): void => {
  const rect: Rect = {
    left: x - pointWidthPxHalf,
    top: y - pointWidthPxHalf,
    width: pointWidthPxHalf * 2,
    height: pointWidthPxHalf * 2,
  };

  updateRectangleGraphics(point, rect, color);

  point.hitArea = new Rectangle(rect.left, rect.top, rect.width, rect.height);
};

export const updatePointOfBbox = (
  pixiBbox: PixiBbox,
  direction: Direction,
  pointAfter: Point
): void => {
  updateBboxPoint(
    pixiBbox.pixi.points[direction],
    pointAfter.x,
    pointAfter.y,
    pixiBbox.style.pointWidthPxHalf,
    pixiBbox.style.borderColor
  );
};
