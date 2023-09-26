/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-restricted-syntax */
/* eslint-disable functional/immutable-data */

import {
  useEventObservable,
  useObservable,
  useObservableEffect,
  useObservableReducer,
  useObservableState,
  useObservableValue,
  useValueAsObservable,
  useVoidEventObservable,
} from '@noshiro/syncflow-react-hooks';

(global as any).useEventObservable = useEventObservable;
(global as any).useObservable = useObservable;
(global as any).useObservableEffect = useObservableEffect;
(global as any).useObservableReducer = useObservableReducer;
(global as any).useObservableState = useObservableState;
(global as any).useObservableValue = useObservableValue;
(global as any).useValueAsObservable = useValueAsObservable;
(global as any).useVoidEventObservable = useVoidEventObservable;
