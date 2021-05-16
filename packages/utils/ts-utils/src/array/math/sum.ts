import type { uint32 } from '../../types';
import { isEmpty } from '../is-empty';

export function sum(array: readonly uint32[]): uint32;
export function sum(array: readonly number[]): number;
export function sum(array: readonly number[]): number {
  return isEmpty(array) ? 0 : array.reduce((prev, curr) => prev + curr);
}
