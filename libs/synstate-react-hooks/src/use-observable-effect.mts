import * as React from 'react';
import type { Observable } from 'synstate';

/**
 * Subscribes `subscriptionFn` to `observable$` while the component is mounted,
 * and unsubscribes when it unmounts.
 *
 * Each value is passed to the `subscriptionFn` of the latest render, so it sees
 * the current props and state; a new function on every render does not
 * re-subscribe. Passing a different Observable moves the subscription to it,
 * so pass one that keeps its identity across renders (made outside the
 * component, or memoized): one built during render is subscribed again, and an
 * initialized one calls `subscriptionFn` again, on every render.
 *
 * @param observable$ The Observable to subscribe to.
 * @param subscriptionFn Called with each value `observable$` emits.
 */
export const useObservableEffect = <A,>(
  observable$: Observable<A>,
  subscriptionFn: (v: A) => void,
): void => {
  const mut_subscriptionFnRef = React.useRef(subscriptionFn);

  // Runs before the layout and passive effects of the commit, so a value one of
  // them emits already reaches this render's `subscriptionFn`.
  React.useInsertionEffect(() => {
    mut_subscriptionFnRef.current = subscriptionFn;
  });

  React.useEffect(() => {
    const s = observable$.subscribe((v) => {
      mut_subscriptionFnRef.current(v);
    });

    return () => {
      s.unsubscribe();
    };
  }, [observable$]);
};
