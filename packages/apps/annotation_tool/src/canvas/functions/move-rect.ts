import { Point, Rect } from '@mono/ts-utils';

export const moveRect = (rect: Rect, from: Point, to: Point): Rect => ({
  top: rect.top - from.y + to.y,
  left: rect.left - from.x + to.x,
  width: rect.width,
  height: rect.height,
});
