import { type Point } from '../types.mjs';

// LERP = "Linear Interpolation"
export const LERP_FACTOR = 0.3;

export const CANVAS_WIDTH = 500;

export const CANVAS_HEIGHT = 400;

export const lerp = (current: Point, target: Point, factor: number): Point =>
  ({
    x: current.x + (target.x - current.x) * factor,
    y: current.y + (target.y - current.y) * factor,
  }) as const;
