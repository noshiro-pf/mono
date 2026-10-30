import { onScopeDispose, type Observable } from 'synstate';

/**
 * Calls `next` with every value of `source`, the current one first, until
 * the current scope is disposed — what a component that is called once does
 * in place of an effect.
 */
export const subscribeInScope = <A,>(
  source: Observable<A>,
  next: (value: A) => void,
): void => {
  const subscription = source.subscribe(next);

  onScopeDispose(() => {
    subscription.unsubscribe();
  });
};

/**
 * Makes the function that runs work once the update under way has finished:
 * in a microtask, so before the next paint, with the DOM bound to the update
 * already written — and nothing written to a state while another is still
 * propagating, which synstate warns of. Work for a scope disposed by then is
 * dropped.
 *
 * Also what runs after the first mount: a component's nodes are attached to
 * the document only once the whole description they are in is mounted.
 */
export const createAfterUpdate = (): ((work: () => void) => void) => {
  let mut_alive = true;

  onScopeDispose(() => {
    mut_alive = false;
  });

  return (work) => {
    queueMicrotask(() => {
      if (mut_alive) {
        work();
      }
    });
  };
};
