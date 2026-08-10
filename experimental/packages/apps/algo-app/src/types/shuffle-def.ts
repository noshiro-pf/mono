import type * as t from '@noshiro/io-ts';
import { permutationType } from '../utils';

export const shuffleDefType = permutationType<'0123'>('0123');

export type ShuffleDef = t.TypeOf<typeof shuffleDefType>;

export const toShuffleDef = shuffleDefType.cast;
