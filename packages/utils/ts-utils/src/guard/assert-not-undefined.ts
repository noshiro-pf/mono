export const assertNotUndefined = <T>(
  value: T,
  valueName: string = 'the value',
): asserts value is RelaxedExclude<T, undefined> => {
  if (value === undefined) {
    throw new Error(`${valueName} shouldn't be undefined`);
  }
};
