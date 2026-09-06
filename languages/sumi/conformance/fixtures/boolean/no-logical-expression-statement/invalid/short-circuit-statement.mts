export const run = (flag: boolean, check: () => boolean): void => {
  // @sumi-expect boolean/no-logical-expression-statement
  flag && check();
};
