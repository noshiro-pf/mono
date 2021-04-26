import { uint32 } from '../../types';
import { seq } from './seq';

export const range = (
  start: uint32,
  end: uint32,
  step: uint32 = 1 as uint32
): uint32[] =>
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  seq((end - start) as uint32).map((n) => (n * step + start) as uint32);
