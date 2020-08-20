export const newArray = <T>(length: number, init: T): T[] =>
  length < 0
    ? []
    : new Array<T>(
        Number.isSafeInteger(length) ? length : Math.floor(length)
      ).fill(init);
