import { type Variable } from '../types/index.mjs';

export const isVariable = (term: unknown): term is Variable =>
  /* "x" -> true, ["lambda", "x", "x"] -> false */
  typeof term !== 'string' || term.length !== 1 ? false : /[a-z]/u.test(term);
