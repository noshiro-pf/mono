import { Optional } from 'ts-data-forge';
import { type KeepInitialValueOperator } from '../../types/index.mjs';
import { map } from './map.mjs';

export const unwrapOptional = <
  O extends UnknownOptional,
>(): KeepInitialValueOperator<O, Optional.Unwrap<O> | undefined> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  map(Optional.unwrap as Fn<O, Optional.Unwrap<O> | undefined>);
