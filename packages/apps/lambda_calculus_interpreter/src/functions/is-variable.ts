export const isVariable = (term: any): boolean => {
  /* "x" -> true, ["lambda", "x", "x"] -> false */
  if (!term || typeof term !== 'string' || term.length !== 1) return false;
  return term.match(/[a-z]/) !== null;
};
