import { type RectSize } from '../../../types/index.mjs';

export const updateRectSizeElementwise = (
  from: RectSize,
  updateFn: (x: number) => number,
): RectSize => ({
  width: updateFn(from.width),
  height: updateFn(from.height),
});
