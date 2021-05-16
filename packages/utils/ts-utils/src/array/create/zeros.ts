import type { uint32 } from '../../types';
import { newArray } from './new-array';

export function zeros(size: uint32): 0[];
export function zeros(size: number): 0[] | undefined;
export function zeros(size: uint32 | number): 0[] | undefined {
  return newArray(size, 0);
}
