import { promiseState } from '../types';
import { PromiseResult } from './promise-result-type';

export const pending = <P = never, E = never, S = never>(
  p: P
): PromiseResult<P, E, S> => ({
  status: promiseState.pending,
  value: p,
});

export const error = <P = never, E = never, S = never>(
  e: E
): PromiseResult<P, E, S> => ({
  status: promiseState.error,
  value: e,
});

export const success = <P = never, E = never, S = never>(
  s: S
): PromiseResult<P, E, S> => ({
  status: promiseState.success,
  value: s,
});
