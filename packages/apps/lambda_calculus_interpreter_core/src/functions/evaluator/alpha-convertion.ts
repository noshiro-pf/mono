import type {
  LambdaAbstraction,
  LambdaApplication,
  LambdaTerm,
  Variable,
} from '../../types';
import { isAbstraction } from '../is-abstraction';
import { isApplication } from '../is-application';
import { isVariable } from '../is-variable';

/**
 * @desc (λx.M[x]) → (λy.M[y])
 * @param to   "y" of "(λx.M[x]) → (λy.M[y])"
 * @param term "(λx.M[x])" of "(λx.M[x]) → (λy.M[y])"
 */
export function alphaConversion(to: Variable, term: Variable): Variable;
export function alphaConversion(
  to: Variable,
  term: LambdaApplication
): LambdaApplication;
export function alphaConversion(
  to: Variable,
  term: LambdaAbstraction
): LambdaAbstraction;
export function alphaConversion(to: Variable, term: LambdaTerm): LambdaTerm {
  if (!isAbstraction(term)) return term;
  const from = term[1]; // "x" of "(λx.M[x])"
  const sub = (t: LambdaTerm): LambdaTerm => {
    if (isVariable(t)) return t === from ? to : t;
    if (isApplication(t)) return [sub(t[0]), sub(t[1])];
    if (isAbstraction(t))
      return t[1] === from ? t : ['lambda', t[1], sub(t[2])];
    return t; // dummy
  };
  return ['lambda', to, sub(term[2])];
}
