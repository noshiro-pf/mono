export const castRemoveSmallInt = <N extends IntWithSmallInt>(
  n: N
): RemoveSmallInt<N> =>
  // eslint-disable-next-line no-restricted-syntax
  n as RemoveSmallInt<N>;
