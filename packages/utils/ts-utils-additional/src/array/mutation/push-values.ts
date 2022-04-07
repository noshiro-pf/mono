// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export const pushValues = <T>(mut_target: T[], values: readonly T[]): T[] => {
  // eslint-disable-next-line no-restricted-globals
  Array.prototype.push.apply(mut_target, values as T[]);

  return mut_target;
};
