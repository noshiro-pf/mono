import type {
  Answer,
  AnswerSymbolIconId,
  DatetimeRange,
  EventSchedule,
  UserName,
  Weight,
} from '@noshiro/event-schedule-app-shared';
import { createWeight } from '@noshiro/event-schedule-app-shared';
import { IList, IMapMapped, IRecord, ituple, pipe } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import type {
  AnswerSelectionReducerAction,
  DatetimeRangeMapKey,
} from '../../functions';
import {
  answerSelectionReducer,
  datetimeRange2str,
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
} from '../../functions';
import { useFormError } from '../use-form-error-hook';

type AnswerBeingEditedHooks = DeepReadonly<{
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
  answerBeingEditedList: {
    key: string;
    datetimeRange: DatetimeRange;
    selectedSymbol: AnswerSymbolIconId | undefined;
    buttons: {
      iconId: AnswerSymbolIconId;
      symbolDescription: string;
      onClick: () => void;
    }[];
  }[];
  onWeightChange: (v: Weight) => void;
  toggleRequiredSection: () => void;
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

// フォームの入力値のstateは onAnswerBeingEditedUpdate で変更しこのhooks内にはstateを持たない
export const useAnswerBeingEditedHooks = ({
  eventSchedule,
  answers,
  selectedAnswerUserName,
  answerBeingEdited,
  updateAnswerBeingEdited,
}: Readonly<{
  eventSchedule: EventSchedule;
  answers: readonly Answer[];
  selectedAnswerUserName: UserName | undefined;
  answerBeingEdited: Answer;
  updateAnswerBeingEdited: (updater: (answer: Answer) => Answer) => void;
}>): AnswerBeingEditedHooks => {
  const onUserNameChange = useCallback(
    (userName: UserName) => {
      updateAnswerBeingEdited(() =>
        IRecord.set(answerBeingEdited, 'userName', userName)
      );
    },
    [answerBeingEdited, updateAnswerBeingEdited]
  );

  const theNameIsAlreadyUsed: boolean = useMemo(
    () =>
      theNameIsAlreadyUsedFn(
        answerBeingEdited.userName,
        answers,
        selectedAnswerUserName
      ),
    [answers, answerBeingEdited, selectedAnswerUserName]
  );

  const [showUserNameError, onUserNameChangeLocal, onUserNameBlur] =
    useFormError(
      answerBeingEdited.userName,
      (v) =>
        v === '' || theNameIsAlreadyUsedFn(v, answers, selectedAnswerUserName),
      onUserNameChange
    );

  const onCommentChange = useCallback(
    (comment: string) => {
      updateAnswerBeingEdited(() =>
        IRecord.set(answerBeingEdited, 'comment', comment)
      );
    },
    [answerBeingEdited, updateAnswerBeingEdited]
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
        IList.map(answerBeingEdited.selection, (s) =>
          ituple(s.datetimeRange, s.iconId)
        ),
        datetimeRangeToMapKey,
        datetimeRangeFromMapKey
      ),
    [answerBeingEdited.selection]
  );

  const dispatch = useCallback(
    (action: AnswerSelectionReducerAction) => {
      const nextAnswerSelectionMap = answerSelectionReducer(
        answerSelectionMap,
        action
      );
      const next: Answer = IRecord.set(
        answerBeingEdited,
        'selection',
        nextAnswerSelectionMap
          .map((s, d) => ({
            datetimeRange: d,
            iconId: s,
          }))
          .toValuesArray()
      );
      updateAnswerBeingEdited(() => next);
    },
    [answerSelectionMap, answerBeingEdited, updateAnswerBeingEdited]
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

  const answerBeingEditedList = useMemo<
    DeepReadonly<
      {
        key: string;
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
        key: datetimeRange2str(d),
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
      updateAnswerBeingEdited(() =>
        IRecord.set(answerBeingEdited, 'weight', weight)
      );
    },
    [answerBeingEdited, updateAnswerBeingEdited]
  );

  const toggleRequiredSection = useCallback(() => {
    updateAnswerBeingEdited((ans) =>
      IRecord.update(ans, 'isRequiredParticipants', (b) => !b)
    );
  }, [updateAnswerBeingEdited]);

  const toggleWeightSection = useCallback(() => {
    updateAnswerBeingEdited(
      (ans) =>
        pipe(ans)
          .chain((a) => IRecord.update(a, 'useWeight', (b) => !b))
          .chain((a) =>
            a.useWeight ? a : IRecord.set(a, 'weight', createWeight(1))
          ).value
    );
  }, [updateAnswerBeingEdited]);

  return {
    showUserNameError,
    theNameIsAlreadyUsed,
    onUserNameBlur,
    onUserNameChange: onUserNameChangeLocal,
    onCommentChange,
    symbolHeader,
    answerBeingEditedList,
    onWeightChange,
    toggleRequiredSection,
    toggleWeightSection,
  };
};
