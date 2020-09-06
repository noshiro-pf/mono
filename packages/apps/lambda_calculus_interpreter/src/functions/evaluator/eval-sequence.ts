import { MAX_STEPS } from '../../constants/max-steps';
import { isLambdaTerm } from '../is-lambda-term';
import { termEq } from '../term-eq';
import { evaluate1step } from './eval-1-step';

export const evalSequence = (term: any) => {
  if (!term || !isLambdaTerm(term)) return [];
  let curr = term;
  // let prev = undefined;

  const seq = [];
  seq.push(term);

  for (let counter = MAX_STEPS; counter-- > 0; ) {
    const next = evaluate1step(curr);
    if (termEq(next, curr)) break;
    seq.push(next);
    // prev = curr;
    curr = next;
  }
  return seq;
};
