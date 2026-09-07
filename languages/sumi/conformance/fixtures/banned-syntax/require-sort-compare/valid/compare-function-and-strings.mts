export const sortNumbers = (xs: readonly number[]): readonly number[] =>
  xs.toSorted((a, b) => a - b);

export const sortWords = (ws: readonly string[]): readonly string[] =>
  ws.toSorted();
