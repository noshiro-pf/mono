import { isUint32, uint32 } from '../../types';

export function newArray<T>(length: uint32, init: T): T[];
export function newArray<T>(length: number, init: T): T[] | undefined;
export function newArray<T>(length: uint32 | number, init: T): T[] | undefined {
  return !isUint32(length)
    ? undefined
    : new Array(length).fill(0).map(() => init);
}
