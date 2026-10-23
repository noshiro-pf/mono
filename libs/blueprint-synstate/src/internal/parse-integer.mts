import { Num, Result } from 'ts-data-forge';

/** The base-10 integer `text` is, or `NaN` if it is not one. */
export const parseInteger = (text: string): number =>
  Result.unwrapOkOr(Num.safeParseInt(text), Number.NaN);
