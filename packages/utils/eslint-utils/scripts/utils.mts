export const isArray = (a: unknown): a is readonly unknown[] =>
  Array.isArray(a);

export const toCapitalCase = (str: string): string =>
  str
    .replaceAll(/-./gu, (x) => x[1]?.toUpperCase() ?? str)
    .replace(/^./u, (x) => x[0]?.toUpperCase() ?? str);

export const deepCopy = <T,>(obj: T): T =>
  // eslint-disable-next-line no-restricted-syntax
  JSON.parse(JSON.stringify(obj)) as T;

export const deepReplace = <T,>(obj: T, from: string, to: string): T => {
  const s = JSON.stringify(obj);
  const r = s.replaceAll(from, to);
  const parsed = JSON.parse(r);
  // eslint-disable-next-line no-restricted-syntax
  return parsed as T;
};

export const toStr: (v: unknown) => string =
  // eslint-disable-next-line no-restricted-syntax
  String;

export const toSafeUint = (v: number): SafeUint =>
  // eslint-disable-next-line no-restricted-syntax
  v as SafeUint;