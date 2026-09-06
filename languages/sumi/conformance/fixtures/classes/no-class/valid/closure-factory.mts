export type Counter = Readonly<{
  value: () => number;
  increment: () => void;
}>;

export const createCounter = (): Counter => {
  let mut_value = 0;

  return {
    value: () => mut_value,
    increment: () => {
      mut_value += 1;
    },
  };
};
