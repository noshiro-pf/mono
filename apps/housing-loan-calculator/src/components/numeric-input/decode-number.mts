import { Num, Result } from 'ts-data-forge';

/**
 * The number a numeric input of the page reads from its text. A number too
 * large for a double, such as `1e400`, is the infinity it overflows to, as is
 * `Infinity` itself, which `NumericInput` clamps to the bound it passes; other
 * text that is no number, such as `''` or `'12px'`, is `NaN`, which `normalize`
 * replaces.
 */
export const decodeNumber = (text: string): number => {
  const parsed = Num.safeParseFloat(text);

  return Result.isOk(parsed) ? parsed.value : overflowOf(text);
};

const overflowOf = (text: string): number => {
  // `Number` only for text `Num.safeParseFloat` has refused, to tell a number
  // that overflows, in any form, from text that is none; what it reads more
  // laxly than that, such as `''`, comes out finite and is refused.
  // eslint-disable-next-line ts-data-forge/prefer-num-safe-parse-float
  const n = Number(text);

  return Math.abs(n) === Number.POSITIVE_INFINITY ? n : Number.NaN;
};
