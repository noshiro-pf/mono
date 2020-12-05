import { memoNamed } from '@mono/react-utils';
import React, { useCallback, useMemo } from 'react';
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
import { MyAnswerView } from './my-answer-view';

interface Props {
  eventSchedule: IEventSchedule;
  myAnswer: IAnswer;
  onMyAnswerChange: (answer: IAnswer) => void;
  onCancel: () => void;
  onDeleteAnswer: () => void;
  onSubmitAnswer: () => void;
  myAnswerSectionState: 'hidden' | 'creating' | 'editing';
  submitButtonIsLoading: boolean;
  submitButtonIsDisabled: boolean;
}

export const MyAnswer = memoNamed<Props>(
  'MyAnswer',
  ({
    eventSchedule,
    myAnswer,
    onMyAnswerChange,
    onCancel,
    onDeleteAnswer,
    onSubmitAnswer,
    myAnswerSectionState,
    submitButtonIsLoading,
    submitButtonIsDisabled,
  }) => {
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

    return (
      <MyAnswerView
        eventSchedule={eventSchedule}
        userName={myAnswer.userName}
        onUserNameChange={onUserNameChange}
        comment={myAnswer.comment}
        onCommentChange={onCommentsChange}
        symbolHeader={symbolHeader}
        myAnswerList={myAnswerList}
        onCancel={onCancel}
        onDelete={onDeleteAnswer}
        onSubmit={onSubmitAnswer}
        myAnswerSectionState={myAnswerSectionState}
        submitButtonIsLoading={submitButtonIsLoading}
        submitButtonIsDisabled={submitButtonIsDisabled}
      />
    );
  }
);
