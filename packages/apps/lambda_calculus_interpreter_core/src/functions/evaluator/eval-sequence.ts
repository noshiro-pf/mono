import { MAX_STEPS } from '../../constants';
import { LambdaTerm } from '../../types';
import { isLambdaTerm } from '../is-lambda-term';
import { termEq } from '../term-eq';
import { evaluate1step } from './eval-1-step';

export const evalSequence = (term: LambdaTerm): LambdaTerm[] => {
  if (!isLambdaTerm(term)) return [];
  let curr = term;
  // let prev = undefined;

  const seq: LambdaTerm[] = [];
  seq.push(term);

  for (let counter = MAX_STEPS; counter > 0; counter -= 1) {
    const next = evaluate1step(curr);
    if (termEq(next, curr)) break;
    seq.push(next);
    // prev = curr;
    curr = next;
  }
  return seq;
};
