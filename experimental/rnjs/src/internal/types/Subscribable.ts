import { Subscription } from './Subscription';

export type Subscribable<A> = {
  subscribe: (
    next: (v: A) => void,
    error?: (e?: any) => void,
    complete?: () => void
  ) => Subscription;
};
