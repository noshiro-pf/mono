// A literal `null` violates both rules at once: writing it is one fault, and
// the declaration then carrying it in its type is what the other rule names.
// The corpus records what the engines report, so both markers belong here.
// @sumi-expect-error null/no-null-literal
// @sumi-expect-error null/no-null-propagation
export const empty = null;
