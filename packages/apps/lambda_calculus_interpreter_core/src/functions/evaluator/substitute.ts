import type { LambdaTerm, Variable } from '../../types';
import { getFreeVariables } from '../get-free-variables';
import { isAbstraction } from '../is-abstraction';
import { isApplication } from '../is-application';
import { isVariable } from '../is-variable';
import { pickUpAvailableVariable } from '../pickup-available-variable';
import { alphaConversion } from './alpha-convertion';

/**
 * @desc substitute term2 for x in formula term1 in capture-avoiding manner.
 * formally:
 * x[x := N]       = N
 * y[x := N]       = y, if x ≠ y
 * (M1 M2)[x := N] = (M1[x := N]) (M2[x := N])
 * (λx.M)[x := N]  = λx.M
 * (λy.M)[x := N]  = λy.(M[x := N]), if x ≠ y, provided y ∉ FV(N)
 * if y ∈ FV(N) then proceed α-conversion
 */
export const substitute = (
  to: LambdaTerm,
  from: Variable,
  term: LambdaTerm
): LambdaTerm => {
  // console.log( 'substitute', to, from, term );
  if (isVariable(term)) {
    return term === from ? to : term;
  }
  if (isApplication(term)) {
    return [substitute(to, from, term[0]), substitute(to, from, term[1])];
  }
  if (isAbstraction(term)) {
    const [, arg, body] = term;

    if (arg === from) return term;

    const freeVariables = getFreeVariables(to);
    if (!freeVariables.includes(arg)) {
      return ['lambda', arg, substitute(to, from, body)];
    } else {
      const v = pickUpAvailableVariable(freeVariables);
      const converted = alphaConversion(v, term);
      return substitute(to, from, converted);
    }
  }
  console.error(`Syntax error: "${JSON.stringify(term)}" is not lambda term.`);
  return term;
};
