export const run = (flag: boolean, check: () => boolean): void => {
  if (flag) {
    check();
  }
};
