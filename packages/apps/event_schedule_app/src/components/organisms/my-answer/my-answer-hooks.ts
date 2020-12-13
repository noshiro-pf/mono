import { useCallback, useMemo } from 'react';
import { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import { IAnswer } from '../../../types/record/answer';
import { createIAnswerSelection } from '../../../types/record/answer-selection';
import { IDatetimeRange } from '../../../types/record/datetime-range';
import { IEventSchedule } from '../../../types/record/event-schedule';
import { IList, IMap } from '../../../utils/immutable';
import {
  answerSelectionReducer,
  AnswerSelectionReducerAction,
} from './answer-selection-reducer';

interface MyAnswerHooks {
  userName: string;
  onUserNameChange: (v: string) => void;
  comment: string;
  onCommentChange: (v: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  symbolHeader: IList<{
    iconId: AnswerSymbolIconId;
    symbolDescription: string;
    onClick: () => void;
  }>;
  myAnswerList: IList<{
    datetimeRange: IDatetimeRange;
    selectedSymbol: AnswerSymbolIconId | undefined;
    buttons: IList<{
      iconId: AnswerSymbolIconId;
      symbolDescription: string;
      onClick: () => void;
    }>;
  }>;
}

export const useMyAnswerHooks = (
  eventSchedule: IEventSchedule,
  myAnswer: IAnswer,
  onMyAnswerChange: (answer: IAnswer) => void,
  onDeleteAnswer: () => void,
  onSubmitAnswer: () => void
): MyAnswerHooks => {
  const onUserNameChange = useCallback(
    (userName) => {
      onMyAnswerChange(myAnswer.set('userName', userName));
    },
    [myAnswer, onMyAnswerChange]
  );

  const onCommentsChange = useCallback(
    (comment) => {
      onMyAnswerChange(myAnswer.set('comment', comment));
    },
    [myAnswer, onMyAnswerChange]
  );

  const answerSelectionMap = useMemo<
    IMap<IDatetimeRange, AnswerSymbolIconId | undefined>
  >(() => IMap(myAnswer.selection.map((s) => [s.datetimeRange, s.iconId])), [
    myAnswer.selection,
  ]);

  const dispatch = useCallback(
    (action: AnswerSelectionReducerAction) => {
      const nextAnswerSelectionMap = answerSelectionReducer(
        answerSelectionMap,
        action
      );
      const next: IAnswer = myAnswer.set(
        'selection',
        nextAnswerSelectionMap
          .map((s, d) =>
            createIAnswerSelection({
              datetimeRange: d,
              iconId: s,
            })
          )
          .toList()
      );
      onMyAnswerChange(next);
    },
    [answerSelectionMap, myAnswer, onMyAnswerChange]
  );

  const symbolHeader = useMemo<
    IList<{
      iconId: AnswerSymbolIconId;
      symbolDescription: string;
      onClick: () => void;
    }>
  >(
    () =>
      eventSchedule.answerSymbolList.map((s) => ({
        iconId: s.iconId,
        symbolDescription: s.description,
        onClick: () => {
          dispatch({
            type: 'header',
            icon: s.iconId,
            datetimeRangeList: eventSchedule.datetimeRangeList,
          });
        },
      })),
    [eventSchedule, dispatch]
  );

  const myAnswerList = useMemo<
    IList<{
      datetimeRange: IDatetimeRange;
      selectedSymbol: AnswerSymbolIconId | undefined;
      buttons: IList<{
        iconId: AnswerSymbolIconId;
        symbolDescription: string;
        onClick: () => void;
      }>;
    }>
  >(
    () =>
      eventSchedule.datetimeRangeList.map((d) => ({
        datetimeRange: d,
        selectedSymbol: answerSelectionMap.get(d),
        buttons: eventSchedule.answerSymbolList.map((s) => ({
          iconId: s.iconId,
          symbolDescription: s.description,
          onClick: () => {
            dispatch({ type: 'cell', datetimeRange: d, icon: s.iconId });
          },
        })),
      })),
    [answerSelectionMap, dispatch, eventSchedule]
  );

  return {
    userName: myAnswer.userName,
    onUserNameChange: onUserNameChange,
    comment: myAnswer.comment,
    onCommentChange: onCommentsChange,
    symbolHeader: symbolHeader,
    myAnswerList: myAnswerList,
    onDelete: onDeleteAnswer,
    onSubmit: onSubmitAnswer,
  };
};
