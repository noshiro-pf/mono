export const run = (flag: boolean, check: () => boolean): void => {
  // @tsubu-expect boolean/no-logical-expression-statement
  flag && check();
};
