import { type Point, type Rect, type Rgba } from '@noshiro/ts-utils-additional';
import { Rectangle, type Graphics } from 'pixi.js-legacy';
import { type PixiBbox } from '../types';
import { type Direction } from './bbox-points';
import { updateRectangleGraphics } from './create-pixi-object';

export const updateBboxPoint = (
  mut_point: Graphics,
  x: number,
  y: number,
  pointWidthPxHalf: number,
  color: Rgba,
): void => {
  const rect: Rect = {
    left: x - pointWidthPxHalf,
    top: y - pointWidthPxHalf,
    width: pointWidthPxHalf * 2,
    height: pointWidthPxHalf * 2,
  };

  updateRectangleGraphics(mut_point, rect, color);

  mut_point.hitArea = new Rectangle(
    rect.left,
    rect.top,
    rect.width,
    rect.height,
  );
};

export const updatePointOfBbox = (
  pixiBbox: PixiBbox,
  direction: Direction,
  pointAfter: Point,
): void => {
  updateBboxPoint(
    pixiBbox.pixi.points[direction],
    pointAfter.x,
    pointAfter.y,
    pixiBbox.style.pointWidthPxHalf,
    pixiBbox.style.borderColor,
  );
};
