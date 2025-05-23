import { type Rect } from '../../../types/index.mjs';

export const updateRectElementwise = (
  from: Rect,
  updateFn: (x: number) => number,
): Rect => ({
  top: updateFn(from.top),
  left: updateFn(from.left),
  width: updateFn(from.width),
  height: updateFn(from.height),
});
