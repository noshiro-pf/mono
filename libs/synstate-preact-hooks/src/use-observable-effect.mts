import * as Preact from 'preact/hooks';
import type { Observable } from 'synstate';

/**
 * Subscribes `subscriptionFn` to `observable$` while the component is
 * mounted, and unsubscribes when it unmounts.
 *
 * Each value is passed to the `subscriptionFn` of the latest render, so it
 * sees the current props and state; a new function on every render does not
 * re-subscribe. Passing a different Observable moves the subscription to it,
 * so pass one that keeps its identity across renders (made outside the
 * component, or memoized): one built during render is subscribed again, and
 * an initialized one calls `subscriptionFn` again, on every render.
 *
 * @param observable$ The Observable to subscribe to.
 * @param subscriptionFn Called with each value `observable$` emits.
 */
export const useObservableEffect = <A,>(
  observable$: Observable<A>,
  subscriptionFn: (v: A) => void,
): void => {
  const mut_subscriptionFnRef = Preact.useRef(subscriptionFn);

  // Stored as the component renders, before any effect of the commit can
  // emit. Preact has no concurrent rendering; only a render that throws (to
  // an error boundary, or to suspend) leaves its function here until the
  // next render.
  mut_subscriptionFnRef.current = subscriptionFn;

  Preact.useEffect(() => {
    const s = observable$.subscribe((v) => {
      mut_subscriptionFnRef.current(v);
    });

    return () => {
      s.unsubscribe();
    };
  }, [observable$]);
};
