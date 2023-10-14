import { type Point } from '../../../types';

export const updatePointElementwise = (
  from: Point,
  updateFn: (x: number) => number,
): Point => ({
  x: updateFn(from.x),
  y: updateFn(from.y),
});
