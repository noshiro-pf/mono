import type * as t from 'ts-fortress';
import { permutationType } from '../utils/index.mjs';

export const shuffleDefType = permutationType<'0123'>('0123');

export type ShuffleDef = t.TypeOf<typeof shuffleDefType>;

export const toShuffleDef = shuffleDefType.cast;
