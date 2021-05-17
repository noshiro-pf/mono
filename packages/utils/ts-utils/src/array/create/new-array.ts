import type { uint32 } from '../../types';
import { isUint32 } from '../../types';

export function newArray<T>(size: uint32, init: T): T[];
export function newArray<T>(size: number, init: T): T[] | undefined;
export function newArray<T>(size: uint32 | number, init: T): T[] | undefined {
  return !isUint32(size) ? undefined : new Array(size).fill(0).map(() => init);
}
