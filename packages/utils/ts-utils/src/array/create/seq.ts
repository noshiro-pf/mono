import type { uint32 } from '../../types';
import { zeros } from './zeros';

export function seq(size: uint32): uint32[];
export function seq(size: number): uint32[] | undefined;
export function seq(size: uint32 | number): uint32[] | undefined {
  return zeros(size)?.map((_, i) => i) as uint32[] | undefined;
}
