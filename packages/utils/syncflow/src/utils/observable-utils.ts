import { noop } from '@noshiro/ts-utils';
import type { Subscriber } from '../types';

export const toSubscriber = <A>(
  onNext: (v: A) => void,
  onComplete?: () => void
): Subscriber<A> => {
  return {
    onNext,
    onComplete: onComplete ?? noop,
  };
};
