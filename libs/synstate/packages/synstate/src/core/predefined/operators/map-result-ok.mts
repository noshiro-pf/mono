import { Result } from 'ts-data-forge';
import { type KeepInitialValueOperator } from '../../types/index.mjs';
import { map } from './map.mjs';

export const mapResultOk = <R extends UnknownResult, S2>(
  mapFn: (x: Result.UnwrapOk<R>) => S2,
): KeepInitialValueOperator<R, Result<S2, Result.UnwrapErr<R>>> =>
  map((a) => Result.map(a, mapFn));
