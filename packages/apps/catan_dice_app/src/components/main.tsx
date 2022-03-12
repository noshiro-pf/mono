import { memoNamed } from '@noshiro/react-utils';
import {
  interval,
  map,
  mapTo,
  merge,
  scan,
  switchMap,
  take,
  withInitialValue,
} from '@noshiro/syncflow';
import {
  useObservable,
  useObservableValue,
  useVoidEventObservable,
} from '@noshiro/syncflow-react-hooks';
import { historyReducer, historyToSumCount } from '../functions';
import { defaultHistoryState } from '../type';
import { MainView } from './main-view';

const sumCountInitial = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as const;

export const Main = memoNamed('Main', () => {
  const [rollDices$, rollDices] = useVoidEventObservable();
  const [undo$, undo] = useVoidEventObservable();
  const [redo$, redo] = useVoidEventObservable();

  const history$ = useObservable(() =>
    merge([
      rollDices$.chain(mapTo('roll-dices' as const)),
      undo$.chain(mapTo('undo' as const)),
      redo$.chain(mapTo('redo' as const)),
    ] as const).chain(scan(historyReducer, defaultHistoryState))
  );

  const undoable$ = useObservable(() =>
    history$.chain(map((h) => h.index > -1)).chain(withInitialValue(false))
  );

  const redoable$ = useObservable(() =>
    history$
      .chain(map((h) => h.index < h.history.length - 1))
      .chain(withInitialValue(false))
  );

  const diceValues$ = useObservable<readonly [number, number]>(() =>
    history$
      .chain(
        map(
          (histState) => histState.history[histState.index] ?? ([0, 0] as const)
        )
      )
      .chain(withInitialValue([0, 0] as const))
  );

  const sumCount$ = useObservable<ReadonlyArrayOfLength<11, number>>(() =>
    history$
      .chain(map(historyToSumCount))
      .chain(withInitialValue(sumCountInitial))
  );

  const opacity$ = useObservable<number>(() =>
    rollDices$
      .chain(
        switchMap(() =>
          interval(50)
            .chain(take(11))
            .chain(map((i) => (10 - i) / 10))
        )
      )
      .chain(withInitialValue(0))
  );

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
