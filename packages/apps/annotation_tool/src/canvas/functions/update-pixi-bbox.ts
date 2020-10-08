import { Rect } from '@mono/ts-utils';
import { PixiBbox } from '../types/pixi-bbox';
import { bboxPointsFromRect, foreachBboxPoints } from './bbox-points';
import { updatePointOfBbox } from './update-pixi-bbox-point';
import { updateRectOfBbox } from './update-pixi-bbox-rect';

export const updatePixiBbox = (pixiBbox: PixiBbox, rectAfter: Rect): void => {
  pixiBbox.rect = rectAfter;
  updateRectOfBbox(pixiBbox, rectAfter);

  const pointsPosAfter = bboxPointsFromRect(rectAfter);

  foreachBboxPoints(pixiBbox.pixi.points, (direction, _) => {
    updatePointOfBbox(pixiBbox, direction, pointsPosAfter[direction]);
  });
};
