// `&&=` and `||=` fold booleans, exactly as `&&` and `||` do, so both
// operands must be boolean (D-29).
export const bothBoolean = (flag: boolean, other: boolean): boolean => {
  let mut_result = flag;

  mut_result &&= other;

  mut_result ||= other;

  return mut_result;
};

// `??=` coalesces a value rather than folding booleans, so it is exempt.
export const coalesce = (value: string | undefined): string => {
  let mut_text = value;

  mut_text ??= 'fallback';

  return mut_text;
};
