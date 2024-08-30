import { merge } from '@noshiro/syncflow';
import { calcAll } from '../functions';
import { store$ } from './store';

const calcAllSources$ = store$;

export const calculatedValues$ = calcAllSources$
  .chain(debounceTime(500))
  .chain(map(calcAll));

// eslint-disable-next-line deprecation/deprecation
export const isCalculating$: InitializedObservable<boolean> = merge([
  calcAllSources$.chain(mapTo(true)),
  calculatedValues$.chain(mapTo(false)),
]).chain(setInitialValue(false));
