// A destructuring assignment writes to every access it holds, as `=` does.
const mut_source = { a: 1, b: 2 };

const alias = mut_source;

const pair = [3, 4] as const;

[
  // @sumi-expect-error mutation/no-mutation-without-mut-prefix
  alias.a,
  // @sumi-expect-error mutation/no-mutation-without-mut-prefix
  alias.b,
] = pair;

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
({ a: alias.b } = mut_source);

// The `mut_` prefix on the path still makes the write legal.
[mut_source.a] = pair;

export const result = alias;
