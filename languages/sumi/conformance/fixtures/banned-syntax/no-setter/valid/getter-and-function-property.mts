const state = { count: 1 } as const;

export const box = {
  get value(): number {
    return state.count;
  },
  read: (): number => state.count,
} as const;
