import { promiseState } from '../types';
import { Error, Pending, Success, WPS } from './with-promise-state';

export const isUnresolved = <P, E, S>(wps: WPS<P, E, S>): wps is Pending<P> =>
  wps.status === promiseState.pending;

export const isError = <P, E, S>(wps: WPS<P, E, S>): wps is Error<E> =>
  wps.status === promiseState.error;

export const isSuccess = <P, E, S>(wps: WPS<P, E, S>): wps is Success<S> =>
  wps.status === promiseState.success;
