export const castRemoveSmallInt = <N extends IntWithSmallInt>(
  n: N,
): RemoveSmallInt<N> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  n as RemoveSmallInt<N>;
