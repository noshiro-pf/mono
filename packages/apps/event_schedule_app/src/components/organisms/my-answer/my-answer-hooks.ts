import { useCallback, useMemo } from 'react';
import { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import { UserName } from '../../../types/phantom';
import { IAnswer } from '../../../types/record/answer';
import { createIAnswerSelection } from '../../../types/record/answer-selection';
import { IDatetimeRange } from '../../../types/record/datetime-range';
import { IEventSchedule } from '../../../types/record/event-schedule';
import { IList, IMap } from '../../../utils/immutable';
import { useFormError } from '../../../utils/use-form-error-hook';
import {
  answerSelectionReducer,
  AnswerSelectionReducerAction,
} from './answer-selection-reducer';

type MyAnswerHooks = Readonly<{
  userName: UserName;
  showUserNameError: boolean;
  theNameIsAlreadyUsed: boolean;
  onUserNameBlur: () => void;
  onUserNameChange: (v: UserName) => void;
  comment: string;
  onCommentChange: (v: string) => void;
  symbolHeader: IList<
    Readonly<{
      iconId: AnswerSymbolIconId;
      symbolDescription: string;
      onClick: () => void;
    }>
  >;
  myAnswerList: IList<
    Readonly<{
      datetimeRange: IDatetimeRange;
      selectedSymbol: AnswerSymbolIconId | undefined;
      buttons: IList<
        Readonly<{
          iconId: AnswerSymbolIconId;
          symbolDescription: string;
          onClick: () => void;
        }>
      >;
    }>
  >;
}>;

const theNameIsAlreadyUsedFn = (
  userName: UserName,
  answers: IList<IAnswer>,
  nameToOmit: UserName | undefined
): boolean =>
  userName !== undefined && userName === nameToOmit
    ? false
    : answers.find((a) => a.userName === userName) !== undefined;

export const useMyAnswerHooks = (
  eventSchedule: IEventSchedule,
  answers: IList<IAnswer>,
  usernameDuplicateCheckException: UserName | undefined,
  myAnswer: IAnswer,
  onMyAnswerChange: (answer: IAnswer) => void
): MyAnswerHooks => {
  const onUserNameChange = useCallback(
    (userName) => {
      onMyAnswerChange(myAnswer.set('userName', userName));
    },
    [myAnswer, onMyAnswerChange]
  );

  const theNameIsAlreadyUsed: boolean = useMemo(
    () =>
      theNameIsAlreadyUsedFn(
        myAnswer.userName,
        answers,
        usernameDuplicateCheckException
      ),
    [answers, myAnswer, usernameDuplicateCheckException]
  );

  const [
    showUserNameError,
    onUserNameChangeLocal,
    onUserNameBlur,
  ] = useFormError(
    myAnswer.userName,
    (v) =>
      v === '' ||
      theNameIsAlreadyUsedFn(v, answers, usernameDuplicateCheckException),
    onUserNameChange
  );

  const onCommentChange = useCallback(
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
    showUserNameError,
    theNameIsAlreadyUsed,
    onUserNameBlur,
    onUserNameChange: onUserNameChangeLocal,
    comment: myAnswer.comment,
    onCommentChange,
    symbolHeader,
    myAnswerList,
  };
};
