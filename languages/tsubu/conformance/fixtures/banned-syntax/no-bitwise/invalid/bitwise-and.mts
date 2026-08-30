export const masked = (flags: number, mask: number): number =>
  // @tsubu-expect banned-syntax/no-bitwise
  flags & mask;
