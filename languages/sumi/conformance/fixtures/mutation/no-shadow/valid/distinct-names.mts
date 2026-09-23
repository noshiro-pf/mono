const items = [1] as const;

const total = 1;

export const sum = (): number => {
  const inner = 2;

  return total + inner;
};

export { items };
