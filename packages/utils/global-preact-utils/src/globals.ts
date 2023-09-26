/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-restricted-syntax */
/* eslint-disable functional/immutable-data */

import {
  memoNamed,
  useAlive,
  useBoolState,
  usePromiseValue,
  useState,
  useTinyObservable,
  useTinyObservableEffect,
  useTinyObservableValue,
} from '@noshiro/preact-utils';

(global as any).memoNamed = memoNamed;
(global as any).useAlive = useAlive;
(global as any).useBoolState = useBoolState;
(global as any).usePromiseValue = usePromiseValue;
(global as any).useState = useState;
(global as any).useTinyObservable = useTinyObservable;
(global as any).useTinyObservableEffect = useTinyObservableEffect;
(global as any).useTinyObservableValue = useTinyObservableValue;
