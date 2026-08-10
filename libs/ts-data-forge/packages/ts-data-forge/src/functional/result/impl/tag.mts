/** @internal Tag identifying the Ok variant. */
import { type Err, type Ok } from '../../../types.mjs';

export const OkTypeTagName: Ok<unknown>['$$tag'] = 'ts-data-forge::Result.ok';

/** @internal Tag identifying the Err variant. */
export const ErrTypeTagName: Err<unknown>['$$tag'] =
  'ts-data-forge::Result.err';
