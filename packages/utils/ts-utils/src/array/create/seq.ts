import { zeros } from './zeros';

export const seq = (length: number): number[] => zeros(length).map((_, i) => i);
