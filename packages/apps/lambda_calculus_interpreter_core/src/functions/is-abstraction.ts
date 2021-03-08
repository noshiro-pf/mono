import { LambdaAbstraction } from '../types';
import { isLambdaTerm } from './is-lambda-term';
import { isVariable } from './is-variable';

export const isAbstraction = (term: unknown): term is LambdaAbstraction => {
  if (!Array.isArray(term) || term.length !== 3) return false;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [t1, t2, t3] = term;
  return t1 === 'lambda' && isVariable(t2) && isLambdaTerm(t3);
};
