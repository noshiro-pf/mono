import type {
  LambdaAbstraction,
  LambdaApplication,
  LambdaTerm,
  Variable,
} from '../../types/index.mjs';
import { isAbstraction } from '../is-lambda-term.mjs';
import { substitute } from './substitute.mjs';

/**
 * `(λx.M[x]) -> (λy.M[y])`
 *
 * @param to `y` of `(λx.M[x]) -> (λy.M[y])`, not free in the term.
 * @param term `(λx.M[x])` of `(λx.M[x]) -> (λy.M[y])`
 */
export function alphaConversion(to: Variable, term: Variable): Variable;

export function alphaConversion(
  to: Variable,
  term: LambdaApplication,
): LambdaApplication;

export function alphaConversion(
  to: Variable,
  term: LambdaAbstraction,
): LambdaAbstraction;

export function alphaConversion(to: Variable, term: LambdaTerm): LambdaTerm {
  // Renaming the binder is substituting `to` for it, which `substitute` does
  // without capture: a nested binder named `to` that the old name occurs free
  // under is renamed first.
  return isAbstraction(term)
    ? ['lambda', to, substitute(to, term[1], term[2])]
    : term;
}
