import { type NWES } from '../types';

export const directions = ['S', 'W', 'N', 'E'] as const;

expectType<typeof directions, readonly NWES[]>('<=');
