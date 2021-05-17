import type { int } from '../types';

export const roundToInt = (n: number): int => (0 | (n + 0.5)) as int;
