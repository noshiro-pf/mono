import { promiseStatus } from '../types';
import { Error, Pending, PromiseState, Success } from './promise-result-type';

export const isUnresolved = <P, E, S>(
  pr: PromiseState<P, E, S>
): pr is Pending<P> => pr.status === promiseStatus.pending;

export const isError = <P, E, S>(wps: PromiseState<P, E, S>): wps is Error<E> =>
  wps.status === promiseStatus.error;

export const isSuccess = <P, E, S>(
  wps: PromiseState<P, E, S>
): wps is Success<S> => wps.status === promiseStatus.success;
