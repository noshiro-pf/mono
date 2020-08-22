export const pushValues = <T>(target: T[], values: T[]): T[] => {
  Array.prototype.push.apply(target, values);
  return target;
};
