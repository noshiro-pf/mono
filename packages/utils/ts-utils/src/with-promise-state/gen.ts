import { promiseState } from '../types';
import { WPS } from './with-promise-state';

export const pending = <P = never, E = never, S = never>(
  p: P
): WPS<P, E, S> => ({
  status: promiseState.pending,
  value: p,
});

export const error = <P = never, E = never, S = never>(e: E): WPS<P, E, S> => ({
  status: promiseState.error,
  value: e,
});

export const success = <P = never, E = never, S = never>(
  s: S
): WPS<P, E, S> => ({
  status: promiseState.success,
  value: s,
});
