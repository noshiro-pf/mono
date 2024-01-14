import { promiseStatus } from '../types/index.mjs';
import {
  type Pending,
  type PromiseState,
  type SettleError,
  type SettleSuccess,
} from './promise-result-type.mjs';

export const isUnresolved = <P, E, S>(
  pr: PromiseState<P, E, S>,
): pr is Pending<P> => pr.status === promiseStatus.pending;

export const isError = <P, E, S>(
  wps: PromiseState<P, E, S>,
): wps is SettleError<E> => wps.status === promiseStatus.error;

export const isSuccess = <P, E, S>(
  wps: PromiseState<P, E, S>,
): wps is SettleSuccess<S> => wps.status === promiseStatus.success;
