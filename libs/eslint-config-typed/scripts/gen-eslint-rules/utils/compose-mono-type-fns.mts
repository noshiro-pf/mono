export const composeMonoTypeFns =
  <A,>(...fns: readonly ((a: A) => A)[]): ((a: A) => A) =>
  (a) =>
    fns.reduce((result, fn) => fn(result), a);
