export const masked = (flags: number, mask: number): number =>
  // @sumi-expect-error banned-syntax/no-bitwise
  flags & mask;
