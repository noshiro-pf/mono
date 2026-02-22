import { Result } from 'ts-data-forge';
import { type KeepInitialValueOperator } from '../../types/index.mjs';
import { map } from './map.mjs';

export const unwrapResultErr = <
  R extends UnknownResult,
>(): KeepInitialValueOperator<R, Result.UnwrapErr<R> | undefined> =>
  map(Result.unwrapErr as Fn<R, Result.UnwrapErr<R> | undefined>);
