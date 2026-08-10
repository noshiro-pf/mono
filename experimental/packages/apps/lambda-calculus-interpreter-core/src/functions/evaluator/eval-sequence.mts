import { range, toSafeUint } from '@noshiro/ts-utils';
import { MAX_STEPS } from '../../constants/index.mjs';
import { type LambdaTerm } from '../../types/index.mjs';
import { isLambdaTerm } from '../is-lambda-term.mjs';
import { termEq } from '../term-eq.mjs';
import { evaluate1step } from './eval-1-step.mjs';

export const evalSequence = (term: LambdaTerm): LambdaTerm[] => {
  if (!isLambdaTerm(term)) return [];
  let mut_curr = term;
  // let prev = undefined;

  const mut_seq: LambdaTerm[] = [];
  mut_seq.push(term);

  for (const _counter of range(toSafeUint(MAX_STEPS), 0, -1)) {
    const next = evaluate1step(mut_curr);
    if (termEq(next, mut_curr)) break;
    mut_seq.push(next);
    // prev = curr;
    mut_curr = next;
  }
  return mut_seq;
};
