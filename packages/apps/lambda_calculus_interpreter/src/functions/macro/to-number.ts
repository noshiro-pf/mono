import { isNumber } from './is-number';

export const toNumber = (term: any): number | undefined => {
  if (!isNumber(term)) return undefined;
  // const s = term[1];
  const z = term[2][1];
  const body = term[2][2];
  const counter = (t: any): number => (t === z ? 0 : 1 + counter(t[1]));
  return counter(body);
};
