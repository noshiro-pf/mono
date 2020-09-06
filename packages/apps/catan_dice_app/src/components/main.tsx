import {
  useDataStream,
  useStreamValue,
  useVoidEventAsStream,
} from '@mono/react-rxjs-utils';
import { memoNamed } from '@mono/react-utils';
import { mapToConst } from '@mono/rxjs-utils';
import React from 'react';
import { interval, merge } from 'rxjs';
import { map, scan, switchMapTo, take } from 'rxjs/operators';
import { historyReducer } from '../functions/history-reducer';
import { historyToSumCount } from '../functions/history-to-sum-count';
import { IList, IRepeat } from '../immutable';
import { HistoryState } from '../type/history';
import { MainView } from './main-view';

const sumCountInitial = IRepeat(0, 12 - 2 + 1).toList();

export const Main = memoNamed('Main', () => {
  const [rollDices$, rollDices] = useVoidEventAsStream();
  const [undo$, undo] = useVoidEventAsStream();
  const [redo$, redo] = useVoidEventAsStream();

  const history$ = useDataStream(
    HistoryState(),
    merge(
      rollDices$.pipe(mapToConst('roll-dices')),
      undo$.pipe(mapToConst('undo')),
      redo$.pipe(mapToConst('redo'))
    ).pipe(scan(historyReducer, HistoryState()))
  );

  const undoable$ = useDataStream(
    false,
    history$.pipe(map((h) => h.index > -1))
  );

  const redoable$ = useDataStream(
    false,
    history$.pipe(map((h) => h.index < h.history.size - 1))
  );

  const diceValues$ = useDataStream<[number, number]>(
    [0, 0],
    history$.pipe(
      map((histState) => histState.history.get(histState.index, [0, 0]))
    )
  );

  const sumCount$ = useDataStream<IList<number>>(
    sumCountInitial,
    history$.pipe(map(historyToSumCount))
  );

  const opacity$ = useDataStream<number>(
    0,
    rollDices$.pipe(
      switchMapTo(
        interval(50).pipe(
          take(11),
          map((i) => (10 - i) / 10)
        )
      )
    )
  );

  const [dice1, dice2] = useStreamValue(diceValues$, [0, 0] as [
    number,
    number
  ]);
  const sumCount = useStreamValue(sumCount$, sumCountInitial);
  const undoable = useStreamValue(undoable$, false);
  const redoable = useStreamValue(redoable$, false);
  const opacity = useStreamValue(opacity$, 0);

  return (
    <MainView
      diceValue1={dice1}
      diceValue2={dice2}
      sumCount={sumCount}
      opacity={opacity}
      rollDices={rollDices}
      undo={undo}
      redo={redo}
      undoable={undoable}
      redoable={redoable}
    />
  );
});
