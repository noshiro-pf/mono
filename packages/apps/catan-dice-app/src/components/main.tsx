import { interval, merge, switchMap, take } from '@noshiro/syncflow';
import { historyReducer, historyToSumCount } from '../functions';
import { defaultHistoryState } from '../type';
import { MainView } from './main-view';

const sumCountInitial = Tpl.map(
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as const,
  toSafeUint,
);

const [rollDices$, rollDices] = createVoidEventEmitter();
const [undo$, undo] = createVoidEventEmitter();
const [redo$, redo] = createVoidEventEmitter();

const history$ =
  // eslint-disable-next-line deprecation/deprecation
  merge([
    rollDices$.chain(mapTo('roll-dices' as const)),
    undo$.chain(mapTo('undo' as const)),
    redo$.chain(mapTo('redo' as const)),
  ] as const).chain(scan(historyReducer, defaultHistoryState));

const undoable$ = history$
  .chain(map((h) => h.index > -1))
  .chain(setInitialValue(false));

const redoable$ = history$
  .chain(map((h) => h.index < h.history.length - 1))
  .chain(setInitialValue(false));

const diceValues$: InitializedObservable<readonly [number, number]> = history$
  .chain(
    map((histState) => histState.history[histState.index] ?? ([0, 0] as const)),
  )
  .chain(setInitialValue([0, 0] as const));

const sumCount$: InitializedObservable<ArrayOfLength<11, SafeUint>> = history$
  .chain(map(historyToSumCount))
  .chain(setInitialValue(sumCountInitial));

const opacity$: InitializedObservable<number> = rollDices$
  .chain(
    // eslint-disable-next-line deprecation/deprecation
    switchMap(() =>
      interval(50)
        .chain(take(11))
        .chain(map((i) => (10 - i) / 10)),
    ),
  )
  .chain(setInitialValue(0));

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
