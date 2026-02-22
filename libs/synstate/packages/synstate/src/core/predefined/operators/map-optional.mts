import { Optional } from 'ts-data-forge';
import { type KeepInitialValueOperator } from '../../types/index.mjs';
import { map } from './map.mjs';

export const mapOptional = <O extends UnknownOptional, B>(
  mapFn: (x: Optional.Unwrap<O>) => B,
): KeepInitialValueOperator<O, Optional<B>> =>
  map((a) => Optional.map(a, mapFn));
