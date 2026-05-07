/** @internal Tag identifying the Ok variant. */
import {
  type TernaryErr,
  type TernaryOk,
  type TernaryWarn,
} from '../ternary-result.mjs';

export const OkTypeTagName: TernaryOk<unknown>['$$tag'] =
  'ts-data-forge::Result.ok';

/** @internal Tag identifying the Warn variant. */
export const WarnTypeTagName: TernaryWarn<unknown, unknown>['$$tag'] =
  'ts-data-forge::Result.warn';

/** @internal Tag identifying the Err variant. */
export const ErrTypeTagName: TernaryErr<unknown>['$$tag'] =
  'ts-data-forge::Result.err';
