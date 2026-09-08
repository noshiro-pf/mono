export const run = (flag: boolean, check: () => boolean): void => {
  // @sumi-expect-error boolean/no-logical-expression-statement
  flag && check();
};
