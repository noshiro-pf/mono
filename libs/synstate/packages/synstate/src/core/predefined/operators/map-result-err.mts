import { Result } from 'ts-data-forge';
import { type KeepInitialValueOperator } from '../../types/index.mjs';
import { map } from './map.mjs';

export const mapResultErr = <R extends UnknownResult, E2>(
  mapFn: (x: Result.UnwrapErr<R>) => E2,
): KeepInitialValueOperator<R, Result<Result.UnwrapOk<R>, E2>> =>
  map((a) => Result.mapErr(a, mapFn));
