import { Json, Result } from 'ts-data-forge';
import type { LambdaTerm, Variable } from '../../types/index.mjs';
import { getFreeVariables } from '../get-free-variables.mjs';
import { isAbstraction, isApplication } from '../is-lambda-term.mjs';
import { isVariable } from '../is-variable.mjs';
import { pickUpAvailableVariable } from '../pickup-available-variable.mjs';

/**
 * Substitute `to` (N below) for the free occurrences of `from` (x) in `term`
 * (M), without capturing a free variable of N or M.
 *
 * Formally:
 *
 *     x[x := N]       = N
 *     y[x := N]       = y, if x ≠ y
 *     (M1 M2)[x := N] = (M1[x := N]) (M2[x := N])
 *     (λx.M)[x := N]  = λx.M
 *     (λy.M)[x := N]  = λy.(M[x := N]), if x ≠ y, provided y ∉ FV(N)
 *     (λy.M)[x := N]  = λy.M, if y ∈ FV(N) and x ∉ FV(M)
 *     (λy.M)[x := N]  = λz.(M[y := z][x := N]), if y ∈ FV(N) and x ∈ FV(M),
 *                       where z ∉ FV(N) ∪ FV(M)
 */
export const substitute = (
  to: LambdaTerm,
  from: Variable,
  term: LambdaTerm,
): LambdaTerm => {
  const freeVariablesInTo = getFreeVariables(to);

  const sub = (t: LambdaTerm): LambdaTerm => {
    if (isVariable(t)) {
      return t === from ? to : t;
    }

    if (isApplication(t)) {
      return [sub(t[0]), sub(t[1])];
    }

    if (isAbstraction(t)) {
      const [, arg, body] = t;

      if (arg === from) {
        return t;
      }

      if (!freeVariablesInTo.includes(arg)) {
        return ['lambda', arg, sub(body)];
      }

      const freeVariablesInBody = getFreeVariables(body);

      if (!freeVariablesInBody.includes(from)) {
        return t;
      }

      // Rename `arg` to a name free in neither `to` nor `body`: `to` is then
      // not captured, and no free variable of `body` is captured either.
      const v = pickUpAvailableVariable([
        ...freeVariablesInTo,
        ...freeVariablesInBody,
      ]);

      return ['lambda', v, sub(substitute(v, arg, body))];
    }

    console.error(
      `Syntax error: "${Result.unwrapThrow(
        Json.stringify(t),
      )}" is not lambda term.`,
    );

    return t;
  };

  return sub(term);
};
