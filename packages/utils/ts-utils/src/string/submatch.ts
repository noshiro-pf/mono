export const submatch = (
  target: string,
  key: string,
  ignoreCase: boolean = false
): boolean =>
  ignoreCase
    ? submatch(target.toUpperCase(), key.toUpperCase())
    : target.includes(key);
