export const toCapitalCase = (str: string): string =>
  str
    .replaceAll(/-./gu, (x) => x[1]?.toUpperCase() ?? str)
    .replace(/^./u, (x) => x[0]?.toUpperCase() ?? str);

export const deepCopy = <T,>(obj: T): T =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, unicorn/prefer-structured-clone
  JSON.parse(JSON.stringify(obj)) as unknown as T;

export const deepReplace = <T,>(obj: T, from: string, to: string): T => {
  const s = JSON.stringify(obj);
  const r = s.replaceAll(from, to);
  const parsed: unknown = JSON.parse(r);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return parsed as T;
};

export const falseToUndefined = <T,>(
  a: T,
): RelaxedExclude<T, false> | undefined =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  (a === false ? undefined : a) as RelaxedExclude<T, false>;

export const toStr: (v: unknown) => string = String;

export const closeBraceRegexp = /\n\}\n/gu;
