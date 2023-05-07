import { type Point } from '../types';

export const dist = (p: number, q: number): number => Math.abs(p - q);

export const distPos = (a: Point, b: Point): number =>
  Math.hypot(a.x - b.x, a.y - b.y);
