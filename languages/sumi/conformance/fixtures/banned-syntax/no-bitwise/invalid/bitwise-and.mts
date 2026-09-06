export const masked = (flags: number, mask: number): number =>
  // @sumi-expect banned-syntax/no-bitwise
  flags & mask;
