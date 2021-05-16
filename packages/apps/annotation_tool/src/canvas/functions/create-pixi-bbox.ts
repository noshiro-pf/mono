import type { Rect, Rgba } from '@noshiro/ts-utils';
import { roundToInt } from '@noshiro/ts-utils';
import { Graphics } from 'pixi.js';
import { zIndex } from '../z-index';
import type { Direction } from './bbox-points';
import { bboxPointsFromRect, mapBboxPoints } from './bbox-points';
import { updateBboxPoint } from './update-pixi-bbox-point';
import { updateBboxRect } from './update-pixi-bbox-rect';

const createBboxPoint = (
  direction: Direction,
  pointWidthPxHalf: number,
  x: number,
  y: number,
  color: Rgba
): Graphics => {
  const point = new Graphics();

  updateBboxPoint(point, x, y, pointWidthPxHalf, color);

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
    createBboxPoint(direction, pointWidthPxHalf, p.x, p.y, color)
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
