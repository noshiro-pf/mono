export const makeCounter = (): { readonly read: () => number } => {
  const value = 1;

  return { read: () => value };
};
