export const invariant = (condition: boolean, error: string): void => {
  if (!condition) throw new Error(error);
};
