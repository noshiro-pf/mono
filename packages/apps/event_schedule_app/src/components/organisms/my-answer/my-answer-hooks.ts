import type {
  Answer,
  AnswerSymbolIconId,
  DatetimeRange,
  EventSchedule,
  UserName,
  Weight,
} from '@noshiro/event-schedule-app-shared';
import { createWeight } from '@noshiro/event-schedule-app-shared';
import type { DeepReadonly } from '@noshiro/ts-utils';
import { IList, IMapMapped, IRecord, ituple, pipe } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import type { DatetimeRangeMapKey } from '../../../functions';
import {
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
  useFormError,
} from '../../../functions';
import type { AnswerSelectionReducerAction } from './answer-selection-reducer';
import { answerSelectionReducer } from './answer-selection-reducer';

type MyAnswerHooks = DeepReadonly<{
  showUserNameError: boolean;
  theNameIsAlreadyUsed: boolean;
  onUserNameBlur: () => void;
  onUserNameChange: (v: UserName) => void;
  onCommentChange: (v: string) => void;
  symbolHeader: {
    iconId: AnswerSymbolIconId;
    symbolDescription: string;
    onClick: () => void;
  }[];
  myAnswerList: {
    datetimeRange: DatetimeRange;
    selectedSymbol: AnswerSymbolIconId | undefined;
    buttons: {
      iconId: AnswerSymbolIconId;
      symbolDescription: string;
      onClick: () => void;
    }[];
  }[];
  onWeightChange: (v: Weight) => void;
  toggleWeightSection: () => void;
}>;

const theNameIsAlreadyUsedFn = (
  userName: UserName,
  answers: readonly Answer[],
  nameToOmit: UserName | undefined
): boolean =>
  userName === nameToOmit
    ? false
    : answers.find((a) => a.userName === userName) !== undefined;

// フォームの入力値のstateは onMyAnswerUpdate で変更しこのhooks内にはstateを持たない
export const useMyAnswerHooks = ({
  eventSchedule,
  answers,
  selectedAnswerUserName,
  answerForEditing,
  updateAnswerForEditing,
}: Readonly<{
  eventSchedule: EventSchedule;
  answers: readonly Answer[];
  selectedAnswerUserName: UserName | undefined;
  answerForEditing: Answer;
  updateAnswerForEditing: (updater: (answer: Answer) => Answer) => void;
}>): MyAnswerHooks => {
  const onUserNameChange = useCallback(
    (userName: UserName) => {
      updateAnswerForEditing(() =>
        IRecord.set(answerForEditing, 'userName', userName)
      );
    },
    [answerForEditing, updateAnswerForEditing]
  );

  const theNameIsAlreadyUsed: boolean = useMemo(
    () =>
      theNameIsAlreadyUsedFn(
        answerForEditing.userName,
        answers,
        selectedAnswerUserName
      ),
    [answers, answerForEditing, selectedAnswerUserName]
  );

  const [showUserNameError, onUserNameChangeLocal, onUserNameBlur] =
    useFormError(
      answerForEditing.userName,
      (v) =>
        v === '' || theNameIsAlreadyUsedFn(v, answers, selectedAnswerUserName),
      onUserNameChange
    );

  const onCommentChange = useCallback(
    (comment: string) => {
      updateAnswerForEditing(() =>
        IRecord.set(answerForEditing, 'comment', comment)
      );
    },
    [answerForEditing, updateAnswerForEditing]
  );

  const answerSelectionMap = useMemo<
    IMapMapped<
      DatetimeRange,
      AnswerSymbolIconId | undefined,
      DatetimeRangeMapKey
    >
  >(
    () =>
      IMapMapped.new(
        IList.map(answerForEditing.selection, (s) =>
          ituple(s.datetimeRange, s.iconId)
        ),
        datetimeRangeToMapKey,
        datetimeRangeFromMapKey
      ),
    [answerForEditing.selection]
  );

  const dispatch = useCallback(
    (action: AnswerSelectionReducerAction) => {
      const nextAnswerSelectionMap = answerSelectionReducer(
        answerSelectionMap,
        action
      );
      const next: Answer = IRecord.set(
        answerForEditing,
        'selection',
        nextAnswerSelectionMap
          .map((s, d) => ({
            datetimeRange: d,
            iconId: s,
          }))
          .toValuesArray()
      );
      updateAnswerForEditing(() => next);
    },
    [answerSelectionMap, answerForEditing, updateAnswerForEditing]
  );

  const symbolHeader = useMemo<
    readonly Readonly<{
      iconId: AnswerSymbolIconId;
      symbolDescription: string;
      onClick: () => void;
    }>[]
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
    DeepReadonly<
      {
        datetimeRange: DatetimeRange;
        selectedSymbol: AnswerSymbolIconId | undefined;
        buttons: readonly {
          iconId: AnswerSymbolIconId;
          symbolDescription: string;
          onClick: () => void;
        }[];
      }[]
    >
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

  const onWeightChange = useCallback(
    (weight: Weight) => {
      updateAnswerForEditing(() =>
        IRecord.set(answerForEditing, 'weight', weight)
      );
    },
    [answerForEditing, updateAnswerForEditing]
  );

  const toggleWeightSection = useCallback(() => {
    updateAnswerForEditing(
      (ans) =>
        pipe(ans)
          .chain((a) => IRecord.update(a, 'useWeight', (b) => !b))
          .chain((a) =>
            a.useWeight ? a : IRecord.set(a, 'weight', createWeight(1))
          ).value
    );
  }, [updateAnswerForEditing]);

  return {
    showUserNameError,
    theNameIsAlreadyUsed,
    onUserNameBlur,
    onUserNameChange: onUserNameChangeLocal,
    onCommentChange,
    symbolHeader,
    myAnswerList,
    onWeightChange,
    toggleWeightSection,
  };
};
