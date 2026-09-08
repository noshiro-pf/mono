// @sumi-expect-error functions/no-fn-identifier
export const apply = (fn: (x: number) => number): number => fn(1);
