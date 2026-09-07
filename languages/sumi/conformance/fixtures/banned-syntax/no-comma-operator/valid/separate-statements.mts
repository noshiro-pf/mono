const first = (): number => 1;

const second = (): number => 2;

export const results = [first(), second()] as const;
