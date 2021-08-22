import {
  useStream,
  useStreamValue,
  useVoidEventAsStream,
} from '@noshiro/react-syncflow-hooks';
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
import type { ReadonlyArrayOfLength } from '@noshiro/ts-utils';
import { historyReducer, historyToSumCount } from '../functions';
import { defaultHistoryState } from '../type';
import { MainView } from './main-view';

const sumCountInitial = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as const;

export const Main = memoNamed('Main', () => {
  const [rollDices$, rollDices] = useVoidEventAsStream();
  const [undo$, undo] = useVoidEventAsStream();
  const [redo$, redo] = useVoidEventAsStream();

  const history$ = useStream(() =>
    merge([
      rollDices$.chain(mapTo('roll-dices' as const)),
      undo$.chain(mapTo('undo' as const)),
      redo$.chain(mapTo('redo' as const)),
    ] as const).chain(scan(historyReducer, defaultHistoryState))
  );

  const undoable$ = useStream(() =>
    history$.chain(map((h) => h.index > -1)).chain(withInitialValue(false))
  );

  const redoable$ = useStream(() =>
    history$
      .chain(map((h) => h.index < h.history.length - 1))
      .chain(withInitialValue(false))
  );

  const diceValues$ = useStream<readonly [number, number]>(() =>
    history$
      .chain(
        map(
          (histState) => histState.history[histState.index] ?? ([0, 0] as const)
        )
      )
      .chain(withInitialValue([0, 0] as const))
  );

  const sumCount$ = useStream<ReadonlyArrayOfLength<11, number>>(() =>
    history$
      .chain(map(historyToSumCount))
      .chain(withInitialValue(sumCountInitial))
  );

  const opacity$ = useStream<number>(() =>
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

  const [dice1, dice2] = useStreamValue(diceValues$);
  const sumCount = useStreamValue(sumCount$);
  const undoable = useStreamValue(undoable$);
  const redoable = useStreamValue(redoable$);
  const opacity = useStreamValue(opacity$);

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
