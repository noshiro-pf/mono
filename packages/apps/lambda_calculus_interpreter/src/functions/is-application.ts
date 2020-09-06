import { isLambdaTerm } from './is-lambda-term';

export const isApplication = (term: any): boolean => {
  if (!term || !Array.isArray(term) || term.length !== 2) return false;
  return isLambdaTerm(term[0]) && isLambdaTerm(term[1]);
};
