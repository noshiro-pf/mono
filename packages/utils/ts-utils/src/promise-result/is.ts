import { promiseState } from '../types';
import { Error, Pending, PromiseResult, Success } from './promise-result-type';

export const isUnresolved = <P, E, S>(
  pr: PromiseResult<P, E, S>
): pr is Pending<P> => pr.status === promiseState.pending;

export const isError = <P, E, S>(
  wps: PromiseResult<P, E, S>
): wps is Error<E> => wps.status === promiseState.error;

export const isSuccess = <P, E, S>(
  wps: PromiseResult<P, E, S>
): wps is Success<S> => wps.status === promiseState.success;
