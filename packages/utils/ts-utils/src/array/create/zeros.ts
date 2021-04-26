import { uint32 } from '../../types';
import { newArray } from './new-array';

export function zeros(length: uint32): 0[];
export function zeros(length: number): 0[] | undefined;
export function zeros(length: uint32 | number): 0[] | undefined {
  return newArray(length, 0);
}
