import { Result } from 'ts-data-forge';
import { type KeepInitialValueOperator } from '../../types/index.mjs';
import { map } from './map.mjs';

export const unwrapResultOk = <
  R extends UnknownResult,
>(): KeepInitialValueOperator<R, Result.UnwrapOk<R> | undefined> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  map(Result.unwrapOk as Fn<R, Result.UnwrapOk<R> | undefined>);
