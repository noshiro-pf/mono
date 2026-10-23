const mut_counts = new Map<string, number>();

/**
 * `prefix-0`, `prefix-1`, … — an id unique on the page, counted per prefix
 * as Blueprint's `Utils.uniqueId` counts them.
 */
export const uniqueId = (prefix: string): string => {
  const count = mut_counts.get(prefix) ?? 0;

  mut_counts.set(prefix, count + 1);

  return `${prefix}-${count}`;
};
