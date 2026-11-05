/** `1 part`, `2 parts`: a count and a noun that takes `s` in the plural. */
export const plural = (count: number, noun: string): string =>
  `${count} ${noun}${count === 1 ? '' : 's'}` as const;
