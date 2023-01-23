import { type Rect } from '@noshiro/ts-utils-additional';
import { type PixiBbox } from '../types';
import { bboxPointsFromRect, foreachBboxPoints } from './bbox-points';
import { updatePointOfBbox } from './update-pixi-bbox-point';
import { updateRectOfBbox } from './update-pixi-bbox-rect';

export const updatePixiBbox = (
  mut_pixiBbox: PixiBbox,
  rectAfter: Rect
): void => {
  mut_pixiBbox.rect = rectAfter;
  updateRectOfBbox(mut_pixiBbox, rectAfter);

  const pointsPosAfter = bboxPointsFromRect(rectAfter);

  foreachBboxPoints(mut_pixiBbox.pixi.points, (direction, _) => {
    updatePointOfBbox(mut_pixiBbox, direction, pointsPosAfter[direction]);
  });
};
