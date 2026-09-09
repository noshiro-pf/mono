export const findOrNothing = (
  names: readonly string[],
  wanted: string,
  // @sumi-expect-error null/no-null-in-type
): string | null | undefined =>
  names.find((name) => name === wanted) ?? undefined;
