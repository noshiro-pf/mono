import { promiseStatus } from '../types';
import type { PromiseState } from './promise-result-type';

export const pending = <P = never, E = never, S = never>(
  p: P
): PromiseState<P, E, S> => ({
  status: promiseStatus.pending,
  value: p,
});

export const error = <P = never, E = never, S = never>(
  e: E
): PromiseState<P, E, S> => ({
  status: promiseStatus.error,
  value: e,
});

export const success = <P = never, E = never, S = never>(
  s: S
): PromiseState<P, E, S> => ({
  status: promiseStatus.success,
  value: s,
});
