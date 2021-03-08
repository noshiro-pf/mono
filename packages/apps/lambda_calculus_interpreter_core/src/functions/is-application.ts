import { LambdaApplication } from '../types';
import { isLambdaTerm } from './is-lambda-term';

export const isApplication = (term: unknown): term is LambdaApplication => {
  if (!Array.isArray(term) || term.length !== 2) return false;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [t1, t2] = term;
  return isLambdaTerm(t1) && isLambdaTerm(t2);
};
