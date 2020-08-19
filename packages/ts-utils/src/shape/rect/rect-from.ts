import { dist } from '../../num';
import { Rect } from '../../types';

export const RectFromXYs = (
  xs: readonly [number, number],
  ys: readonly [number, number]
): Rect => ({
  top: Math.min(ys[0], ys[1]),
  left: Math.min(xs[0], xs[1]),
  width: dist(xs[0], xs[1]),
  height: dist(ys[0], ys[1]),
});
