import { ISet } from 'ts-data-forge';
import { type TwoDiceSumValue } from '../types/index.mjs';

export const twoDiceSumSet = (): ISet<TwoDiceSumValue> =>
  ISet.create([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
