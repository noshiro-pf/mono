export namespace Str {
  export const cmp = (x: string, y: string): number => x.localeCompare(y);

  export const cmpR = (x: string, y: string): number => cmp(y, x);

  export const toNumber = (numberLike: string): number | undefined => {
    const result = Number.parseFloat(numberLike);

    return Number.isNaN(result) ? undefined : result;
  };

  export const submatch = (
    target: string,
    key: string,
    ignoreCase: boolean = false
  ): boolean =>
    ignoreCase
      ? submatch(target.toUpperCase(), key.toUpperCase())
      : target.includes(key);
}
