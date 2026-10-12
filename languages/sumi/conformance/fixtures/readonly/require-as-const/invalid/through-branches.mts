const flag: boolean = Date.now() > 0;

const given: readonly number[] | undefined = flag ? [1] as const : undefined;

// Each branch of a conditional, and each operand of `??`, is a type the
// binding can take.
export const picked =
  // @sumi-expect-error readonly/require-as-const
  flag ? [1]
  // @sumi-expect-error readonly/require-as-const
  : [2];

export const fallback =
  given ??
  // @sumi-expect-error readonly/require-as-const
  [0];
