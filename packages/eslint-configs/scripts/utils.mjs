export const isArray = (a) => Array.isArray(a);
export const toCapitalCase = (str) =>
  str
    .replaceAll(/-./gu, (x) => x[1]?.toUpperCase() ?? str)
    .replace(/^./u, (x) => x[0]?.toUpperCase() ?? str);
export const deepReplace = (obj, from, to) => {
  const s = JSON.stringify(obj);
  const r = s.replaceAll(from, to);
  const parsed = JSON.parse(r);
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return parsed;
};
// eslint-disable-next-line no-restricted-syntax
export const toStr = String;
