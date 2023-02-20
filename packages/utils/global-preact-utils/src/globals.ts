/* eslint-disable
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-member-access,
  functional/immutable-data
*/

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
