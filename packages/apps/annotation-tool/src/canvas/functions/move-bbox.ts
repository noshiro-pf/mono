import { Point } from '@mono/ts-utils';
import { PixiBbox } from '../types/pixi-bbox';
// import { bboxPointsFromRect, foreachBboxPoints } from './bbox-points';
import { moveRect } from './move-rect';
import { updateRectOfBbox } from './update-pixi-bbox';

export const moveBbox = (pixiBbox: PixiBbox, from: Point, to: Point): void => {
  const rect = moveRect(pixiBbox.rect, from, to);
  console.log('moveBbox', pixiBbox);
  updateRectOfBbox(pixiBbox, rect);

  // const pointsPos = bboxPointsFromRect(pixiBbox.rect);

  // foreachBboxPoints(pixiBbox.pixi.points, (direction, p) => {
  //   p.moveTo(
  //     pointsPos[direction].x - from.x + to.x,
  //     pointsPos[direction].y - from.y + to.y
  //   );
  // });
};
