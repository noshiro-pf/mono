import { type Point } from '../../../types/index.mjs';

export const updatePointElementwise = (
  from: Point,
  updateFn: (x: number) => number,
): Point => ({
  x: updateFn(from.x),
  y: updateFn(from.y),
});
