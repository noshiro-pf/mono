import { Observable } from './abstract_class';

export type Operator<A, B> = (src: Observable<A>) => Observable<B>;

export type Subscriber<A> = {
  next: (v: A) => void;
  error: (e?: any) => void;
  complete: () => void;
};

export type Subscription = {
  unsubscribe: () => void;
};

export type ArrayElement<S> = S extends Array<infer T> ? T : never;

export type ObservableValue<A> = A extends Observable<infer B> ? B : never;

export type Unwrap<A> = { [P in keyof A]: ObservableValue<A[P]> };

export type ObservableType =
  | 'base'
  | 'source'
  | 'sync child'
  | 'async child'
  | 'merge';

export type Subscribable<A> = {
  subscribe(
    next: (v: A) => void,
    error?: (e?: any) => void,
    complete?: () => void
  ): Subscription;
};

export type TimerId = ReturnType<typeof setTimeout>; // NodeJS.Timeout or number
