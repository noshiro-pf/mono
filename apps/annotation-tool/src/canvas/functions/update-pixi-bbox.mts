/* transformer-ignore convert-to-readonly */
//
// PixiJS's scene graph is mutated in place, and so is the canvas's drag state.
// `convert-to-readonly` rewrites these types and every assignment through
// them, which this layer depends on. The `mut_` prefix marks the deliberate
// mutation, as it does elsewhere in the repository.

import { type Rect } from 'ts-utils-additional';
import { type PixiBbox } from '../types/index.mjs';
import { bboxPointsFromRect, foreachBboxPoints } from './bbox-points.mjs';
import { updatePointOfBbox } from './update-pixi-bbox-point.mjs';
import { updateRectOfBbox } from './update-pixi-bbox-rect.mjs';

export const updatePixiBbox = (
  mut_pixiBbox: PixiBbox,
  rectAfter: Rect,
): void => {
  mut_pixiBbox.rect = rectAfter;

  updateRectOfBbox(mut_pixiBbox, rectAfter);

  const pointsPosAfter = bboxPointsFromRect(rectAfter);

  foreachBboxPoints(mut_pixiBbox.pixi.points, (direction, _) => {
    updatePointOfBbox(mut_pixiBbox, direction, pointsPosAfter[direction]);
  });
};
