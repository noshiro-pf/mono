import type { Point, Rect } from '@noshiro/ts-utils';

export const moveRect = (rectPrevious: Rect, from: Point, to: Point): Rect => ({
  top: rectPrevious.top - from.y + to.y,
  left: rectPrevious.left - from.x + to.x,
  width: rectPrevious.width,
  height: rectPrevious.height,
});
