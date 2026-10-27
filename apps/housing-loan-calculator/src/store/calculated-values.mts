import {
  debounce,
  type InitializedObservable,
  map,
  mapTo,
  merge,
  withInitialValue,
} from 'synstate';
import { calcAll } from '../functions/index.mjs';
import { store$ } from './store.mjs';

const calcAllSources$ = store$;

export const calculatedValues$ = calcAllSources$
  .pipe(debounce(500))
  .pipe(map(calcAll));

export const isCalculating$: InitializedObservable<boolean> = merge([
  calcAllSources$.pipe(mapTo(true)),
  calculatedValues$.pipe(mapTo(false)),
]).pipe(withInitialValue(false));
