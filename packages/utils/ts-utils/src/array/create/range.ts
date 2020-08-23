import { seq } from './seq';

export const range = (start: number, end: number, step: number = 1): number[] =>
  seq(end - start).map((n) => n * step + start);
