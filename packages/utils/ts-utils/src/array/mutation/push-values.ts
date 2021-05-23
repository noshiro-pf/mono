// eslint-disable-next-line noshiro-custom/prefer-readonly-parameter-types
export const pushValues = <T>(target: T[], values: readonly T[]): T[] => {
  Array.prototype.push.apply(target, values as T[]);
  return target;
};
