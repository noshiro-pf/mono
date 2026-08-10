import * as React from 'react';
import { type Observable } from 'synstate';

export const useObservableEffect = <A,>(
  observable$: Observable<A>,
  subscriptionFn: (v: A) => void,
): void => {
  React.useEffect(() => {
    const s = observable$.subscribe(subscriptionFn);

    return () => {
      s.unsubscribe();
    };
  }, []);
};
