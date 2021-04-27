import { int } from '../types';

export const randInt = (min: int, max: int): int =>
  ((min as number) + Math.floor((max - min + 1) * Math.random())) as int;
