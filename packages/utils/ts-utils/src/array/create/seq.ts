import { zeros } from '../create';

export const seq = (length: number): number[] => zeros(length).map((_, i) => i);
