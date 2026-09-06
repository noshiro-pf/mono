import { memoNamed } from 'react-utils';
import {
  counter,
  createEventEmitter,
  map,
  mapTo,
  merge,
  scan,
  switchMap,
  take,
  withInitialValue,
  type InitializedObservable,
} from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';
import { Arr, asSafeUint, type SafeUint } from 'ts-data-forge';
import { type FixedLengthTuple } from 'ts-type-forge';
import { historyReducer, historyToSumCount } from '../functions/index.mjs';
import { defaultHistoryState } from '../type/index.mjs';
import { MainView } from './main-view.js';

const sumCountInitial = Arr.map(
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as const,
  asSafeUint,
);

const [rollDices$, rollDices] = createEventEmitter();

const [undo$, undo] = createEventEmitter();

const [redo$, redo] = createEventEmitter();

const history$ = merge([
  rollDices$.pipe(mapTo('roll-dices' as const)),
  undo$.pipe(mapTo('undo' as const)),
  redo$.pipe(mapTo('redo' as const)),
] as const).pipe(scan(historyReducer, defaultHistoryState));

const undoable$ = history$
  .pipe(map((h) => h.index > -1))
  .pipe(withInitialValue(false));

const redoable$ = history$
  .pipe(map((h) => h.index < h.history.length - 1))
  .pipe(withInitialValue(false));

const diceValues$: InitializedObservable<readonly [number, number]> = history$
  .pipe(
    map((histState) => histState.history[histState.index] ?? ([0, 0] as const)),
  )
  .pipe(withInitialValue([0, 0] as const));

const sumCount$: InitializedObservable<FixedLengthTuple<11, SafeUint>> =
  history$.pipe(map(historyToSumCount)).pipe(withInitialValue(sumCountInitial));

const opacity$: InitializedObservable<number> = rollDices$
  .pipe(
    switchMap(() =>
      counter(50)
        .pipe(take(11))
        .pipe(map((i) => (10 - i) / 10)),
    ),
  )
  .pipe(withInitialValue(0));

export const App = memoNamed('App', () => {
  const [dice1, dice2] = useObservableValue(diceValues$);

  const sumCount = useObservableValue(sumCount$);

  const undoable = useObservableValue(undoable$);

  const redoable = useObservableValue(redoable$);

  const opacity = useObservableValue(opacity$);

  return (
    <MainView
      diceValue1={dice1}
      diceValue2={dice2}
      opacity={opacity}
      redo={redo}
      redoable={redoable}
      rollDices={rollDices}
      sumCount={sumCount}
      undo={undo}
      undoable={undoable}
    />
  );
});
