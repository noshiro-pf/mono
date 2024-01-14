import { dist } from '../../num/index.mjs';
import { type Point, type Rect } from '../../types/index.mjs';

export const rectFromXYs = (
  xs: readonly [number, number],
  ys: readonly [number, number],
): Rect => ({
  top: Math.min(ys[0], ys[1]),
  left: Math.min(xs[0], xs[1]),
  width: dist(xs[0], xs[1]),
  height: dist(ys[0], ys[1]),
});

export const rectFrom2Points = (p1: Point, p2: Point): Rect => ({
  top: Math.min(p1.y, p2.y),
  left: Math.min(p1.x, p2.x),
  width: dist(p1.x, p2.x),
  height: dist(p1.y, p2.y),
});
