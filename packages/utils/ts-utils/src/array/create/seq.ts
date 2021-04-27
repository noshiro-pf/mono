import { uint32 } from '../../types';
import { zeros } from './zeros';

export function seq(length: uint32): uint32[];
export function seq(length: number): uint32[] | undefined;
export function seq(length: uint32 | number): uint32[] | undefined {
  return zeros(length)?.map((_, i) => i) as uint32[] | undefined;
}
