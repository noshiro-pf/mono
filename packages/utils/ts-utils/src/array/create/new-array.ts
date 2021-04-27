export const newArray = <T>(length: number, init: T): T[] =>
  length < 0 || !Number.isSafeInteger(length)
    ? []
    : new Array(length).fill(0).map(() => init);
