/* transformer-ignore convert-to-readonly */
//
// PixiJS's scene graph is mutated in place, and so is the canvas's drag state.
// `convert-to-readonly` rewrites these types and every assignment through
// them, which this layer depends on. The `mut_` prefix marks the deliberate
// mutation, as it does elsewhere in the repository.

import { Graphics } from 'pixi.js-legacy';
import { Num } from 'ts-data-forge';
import { type Rect, type Rgba } from 'ts-utils-additional';
import { zIndex } from '../z-index.mjs';
import {
  bboxPointsFromRect,
  mapBboxPoints,
  type Direction,
} from './bbox-points.mjs';
import { updateBboxPoint } from './update-pixi-bbox-point.mjs';
import { updateBboxRect } from './update-pixi-bbox-rect.mjs';

const createBboxPoint = (
  direction: Direction,
  pointWidthPxHalf: number,
  x: number,
  y: number,
  color: Rgba,
): Graphics => {
  const mut_point = new Graphics();

  updateBboxPoint(mut_point, x, y, pointWidthPxHalf, color);

  mut_point.interactive = true;

  mut_point.zIndex = zIndex.bboxPoint;

  switch (direction) {
    case 'n_':
    case 's_':
      mut_point.cursor = 'ns-resize';

      break;
    case 'e_':
    case 'w_':
      mut_point.cursor = 'ew-resize';

      break;
    case 'ne':
    case 'sw':
      mut_point.cursor = 'nesw-resize';

      break;
    case 'nw':
    case 'se':
      mut_point.cursor = 'nwse-resize';

      break;
  }

  return mut_point;
};

const createBboxPoints = (
  rect: Rect,
  pointWidthPx: number,
  color: Rgba,
): Record<Direction, Graphics> => {
  const pointWidthPxHalf = Num.roundToInt(pointWidthPx / 2);

  return mapBboxPoints(bboxPointsFromRect(rect), (direction, p) =>
    createBboxPoint(direction, pointWidthPxHalf, p.x, p.y, color),
  );
};

export const createBboxRect = (
  rect: Rect,
  borderWidthPx: number,
  borderColor: Rgba,
): Graphics => {
  const mut_gr = new Graphics();

  updateBboxRect(mut_gr, rect, borderWidthPx, borderColor, undefined);

  mut_gr.zIndex = zIndex.bboxFace;

  mut_gr.cursor = 'move';

  mut_gr.interactive = true;

  return mut_gr;
};

export const createBbox = (
  rect: Rect,
  borderWidthPx: number,
  pointWidthPx: number,
  borderColor: Rgba,
): readonly [Graphics, Record<Direction, Graphics>] =>
  [
    createBboxRect(rect, borderWidthPx, borderColor),
    createBboxPoints(rect, pointWidthPx, borderColor),
  ] as const;
