// @tsubu-expect functions/no-fn-identifier
export const apply = (fn: (x: number) => number): number => fn(1);
