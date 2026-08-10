import { type Variable } from '../types/index.mjs';

export const isVariable = (term: unknown): term is Variable => {
  /* "x" -> true, ["lambda", "x", "x"] -> false */
  if (typeof term !== 'string' || term.length !== 1) return false;
  return /[a-z]/u.test(term);
};
