export const zeros = (length: number): 0[] =>
  new Array(Math.max(Math.floor(length), 0)).fill(0) as 0[];
