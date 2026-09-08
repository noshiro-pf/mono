// @sumi-expect-error mutation/no-shadow
const Array = [1];

const total = 1;

export const sum = (): number => {
  // @sumi-expect-error mutation/no-shadow
  const total = 2;

  return total;
};

export { Array, total };
