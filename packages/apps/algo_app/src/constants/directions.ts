import { assertType } from '@noshiro/ts-utils';
import type { NWES } from '../types';

export const directions = ['S', 'W', 'N', 'E'] as const;

assertType<TypeExtends<typeof directions, readonly NWES[]>>();
