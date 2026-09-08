const state = { count: 1 };

export const box = {
  get value(): number {
    return state.count;
  },
  read: (): number => state.count,
};
