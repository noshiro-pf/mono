import type { InitializedObservable } from '@noshiro/syncflow';
import {
  debounceTimeI,
  mapI,
  mapTo,
  // eslint-disable-next-line import/no-deprecated
  merge,
  withInitialValue,
} from '@noshiro/syncflow';
import { calcAll } from '../functions';
import { store$ } from './store';

const calcAllSources$ = store$;

export const calculatedValues$ = calcAllSources$
  .chain(debounceTimeI(500))
  .chain(mapI(calcAll));

// eslint-disable-next-line import/no-deprecated
export const isCalculating$: InitializedObservable<boolean> = merge([
  calcAllSources$.chain(mapTo(true)),
  calculatedValues$.chain(mapTo(false)),
] as const).chain(withInitialValue(false));
