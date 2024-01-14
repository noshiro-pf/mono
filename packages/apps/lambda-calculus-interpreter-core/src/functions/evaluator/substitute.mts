import { Json, Result } from '@noshiro/ts-utils';
import { type LambdaTerm, type Variable } from '../../types/index.mjs';
import { getFreeVariables } from '../get-free-variables.mjs';
import { isAbstraction, isApplication } from '../is-lambda-term.mjs';
import { isVariable } from '../is-variable.mjs';
import { pickUpAvailableVariable } from '../pickup-available-variable.mjs';
import { alphaConversion } from './alpha-conversion.mjs';

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
  term: LambdaTerm,
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
  console.error(
    `Syntax error: "${Result.unwrapThrow(
      Json.stringify(term),
    )}" is not lambda term.`,
  );
  return term;
};
