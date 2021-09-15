export const arrCopy = <T>(arr: T[], offset: number = 0): T[] =>
  !Number.isSafeInteger(offset) || offset < 0 || arr.length <= offset
    ? arr.slice()
    : arr.slice(offset);
