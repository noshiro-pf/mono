import { type Point } from '../types';

export const dist = (p: number, q: number): number => Math.abs(p - q);

export const distPos = (a: Point, b: Point): number =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
