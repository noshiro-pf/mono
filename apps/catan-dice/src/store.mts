import {
  counter,
  createEventEmitter,
  type InitializedObservable,
  map,
  mapTo,
  merge,
  scan,
  switchMap,
  take,
  withInitialValue,
} from 'synstate';
import { Arr, asSafeUint, type SafeUint } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import { historyReducer, historyToSumCount } from './functions/index.mjs';
import { defaultHistoryState } from './type/index.mjs';

const sumCountInitial = Arr.map(
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as const,
  asSafeUint,
);

const [rollDices$, rollDices] = createEventEmitter();

const [undo$, undo] = createEventEmitter();

const [redo$, redo] = createEventEmitter();

const history$ = merge([
  rollDices$.pipe(mapTo('roll-dices')),
  undo$.pipe(mapTo('undo')),
  redo$.pipe(mapTo('redo')),
] as const).pipe(scan(historyReducer, defaultHistoryState));

const undoable$: InitializedObservable<boolean> = history$
  .pipe(map((h) => h.index > -1))
  .pipe(withInitialValue(false));

const redoable$: InitializedObservable<boolean> = history$
  .pipe(map((h) => h.index < h.history.length - 1))
  .pipe(withInitialValue(false));

const diceValues$: InitializedObservable<readonly [number, number]> = history$
  .pipe(
    map((histState) => histState.history[histState.index] ?? ([0, 0] as const)),
  )
  .pipe(withInitialValue([0, 0] as const));

const sumCount$: InitializedObservable<FixedLengthTuple<11, SafeUint>> =
  history$.pipe(map(historyToSumCount)).pipe(withInitialValue(sumCountInitial));

/** Fades the dice borders out over half a second after each roll. */
const opacity$: InitializedObservable<number> = rollDices$
  .pipe(
    switchMap(() =>
      counter(50)
        .pipe(take(11))
        .pipe(map((i) => (10 - i) / 10)),
    ),
  )
  .pipe(withInitialValue(0));

export {
  diceValues$,
  opacity$,
  redo,
  redoable$,
  rollDices,
  sumCount$,
  undo,
  undoable$,
};
