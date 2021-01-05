import { Observable } from '../abstract_class';
import { Subscriber } from '../types';
import { isNone, noop, Some } from './utils';

export const monoParentTryUpdate = <A>(
  parent: Observable<A>
): Some<A> | 'skipped' => {
  if (!parent.isUpdated || isNone(parent.currentValue)) return 'skipped';
  return parent.currentValue;
};

export const unifySubscriberType = <A>(
  nextOrSubscriber: ((v: A) => void) | Subscriber<A>,
  error?: (e?: any) => void,
  complete?: () => void
): Subscriber<A> => {
  if (typeof nextOrSubscriber === 'function') {
    return {
      next: nextOrSubscriber ?? noop,
      error: error ?? noop,
      complete: complete ?? noop,
    };
  }
  return nextOrSubscriber;
};
