import { Rect, Rgba, roundToInt } from '@mono/ts-utils';
import { Graphics, Rectangle } from 'pixi.js';
import { zIndex } from '../z-index';
import { bboxPointsFromRect, Direction, mapBboxPoints } from './bbox-points';
import { createRectangleGraphics } from './create-pixi-object';
import { updateBboxRect } from './update-pixi-bbox';

const createBboxPoint = (
  direction: Direction,
  pointWidthPx: number,
  pointWidthPxHalf: number,
  x: number,
  y: number,
  color: Rgba
): Graphics => {
  const rect: Rect = {
    left: x - pointWidthPxHalf,
    top: y - pointWidthPxHalf,
    width: pointWidthPx,
    height: pointWidthPx,
  };
  const point = createRectangleGraphics(rect, color);
  point.hitArea = new Rectangle(rect.left, rect.top, rect.width, rect.height);
  point.interactive = true;
  point.zIndex = zIndex.bboxPoint;
  switch (direction) {
    case 'n_':
    case 's_':
      point.cursor = 'ns-resize';
      break;
    case 'e_':
    case 'w_':
      point.cursor = 'ew-resize';
      break;
    case 'ne':
    case 'sw':
      point.cursor = 'nesw-resize';
      break;
    case 'nw':
    case 'se':
      point.cursor = 'nwse-resize';
      break;
  }

  return point;
};

const createBboxPoints = (
  rect: Rect,
  pointWidthPx: number,
  color: Rgba
): { [key in Direction]: Graphics } => {
  const pointWidthPxHalf = roundToInt(pointWidthPx / 2);
  return mapBboxPoints(bboxPointsFromRect(rect), (direction, p) =>
    createBboxPoint(direction, pointWidthPx, pointWidthPxHalf, p.x, p.y, color)
  );
};

export const createBboxRect = (
  rect: Rect,
  borderWidthPx: number,
  borderColor: Rgba
): Graphics => {
  const gr = new Graphics();
  updateBboxRect(gr, rect, borderWidthPx, borderColor, undefined);
  gr.zIndex = zIndex.bboxFace;
  gr.hitArea = new Rectangle(rect.left, rect.top, rect.width, rect.height);
  gr.cursor = 'move';
  gr.interactive = true;
  return gr;
};

export const createBbox = (
  rect: Rect,
  borderWidthPx: number,
  pointWidthPx: number,
  borderColor: Rgba
): [Graphics, { [key in Direction]: Graphics }] => [
  createBboxRect(rect, borderWidthPx, borderColor),
  createBboxPoints(rect, pointWidthPx, borderColor),
];
