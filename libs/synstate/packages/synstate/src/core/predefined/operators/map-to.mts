import { type KeepInitialValueOperator } from '../../types/index.mjs';
import { map } from './map.mjs';

export const mapTo = <A, B>(value: B): KeepInitialValueOperator<A, B> =>
  map(() => value);
