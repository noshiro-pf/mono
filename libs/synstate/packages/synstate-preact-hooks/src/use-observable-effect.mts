import * as Preact from 'preact/hooks';
import { type Observable } from 'synstate';

export const useObservableEffect = <A,>(
  observable$: Observable<A>,
  subscriptionFn: (v: A) => void,
): void => {
  Preact.useEffect(() => {
    const s = observable$.subscribe(subscriptionFn);

    return () => {
      s.unsubscribe();
    };
  }, []);
};
