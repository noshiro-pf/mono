import type {
  Answer,
  AnswerSymbolId,
  AnswerSymbolPoint,
  DatetimeRange,
  EventSchedule,
  UserName,
  Weight,
} from '@noshiro/event-schedule-app-shared';
import { createWeight } from '@noshiro/event-schedule-app-shared';
import { IList, IMapMapped, IRecord, pipe } from '@noshiro/ts-utils';
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
import type { AnswerSelectionValue } from '../../types';
import { useFormError } from '../use-form-error-hook';

type AnswerBeingEditedHooks = DeepReadonly<{
  showUserNameError: boolean;
  theNameIsAlreadyUsed: boolean;
  onUserNameBlur: () => void;
  onUserNameChange: (v: UserName) => void;
  onCommentChange: (v: string) => void;
  symbolHeader: Record<
    AnswerSymbolId,
    {
      symbolDescription: string;
      onClick: () => void;
    }
  >;
  answerBeingEditedList: {
    key: string;
    datetimeRange: DatetimeRange;
    answerSelectionValue: AnswerSelectionValue;
    buttons: Record<
      AnswerSymbolId,
      {
        description: string;
        onClick: () => void;
      }
    >;
    onPointChange: (point: AnswerSymbolPoint) => void;
  }[];
  onWeightChange: (v: Weight) => void;
  toggleRequiredSection: () => void;
  toggleWeightSection: () => void;
  hasUnanswered: boolean;
}>;

const theNameIsAlreadyUsedFn = (
  userName: UserName,
  answers: readonly Answer[],
  nameToOmit: UserName | undefined
): boolean =>
  userName === nameToOmit
    ? false
    : answers.some((a) => a.userName === userName);

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
    IMapMapped<DatetimeRange, AnswerSelectionValue, DatetimeRangeMapKey>
  >(() => {
    const entries: DeepReadonly<[DatetimeRange, AnswerSelectionValue][]> =
      IList.concat(
        eventSchedule.datetimeRangeList.map((d) => [
          d,
          { iconId: 'none', point: 0 } as const,
        ]),
        answerBeingEdited.selection.map((s) => [s.datetimeRange, s])
      );

    return IMapMapped.new<
      DatetimeRange,
      AnswerSelectionValue,
      DatetimeRangeMapKey
    >(entries, datetimeRangeToMapKey, datetimeRangeFromMapKey);
  }, [answerBeingEdited.selection, eventSchedule.datetimeRangeList]);

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
          .map((s, d) => ({ datetimeRange: d, ...s }))
          .toValuesArray()
      );
      updateAnswerBeingEdited(() => next);
    },
    [answerSelectionMap, answerBeingEdited, updateAnswerBeingEdited]
  );

  const symbolHeader = useMemo<
    DeepReadonly<
      Record<
        AnswerSymbolId,
        {
          symbolDescription: string;
          onClick: () => void;
        }
      >
    >
  >(
    () => ({
      good: {
        symbolDescription: eventSchedule.answerSymbols.good.description,
        onClick: () => {
          dispatch({
            type: 'header',
            icon: 'good',
            datetimeRangeList: eventSchedule.datetimeRangeList,
          });
        },
      },
      fair: {
        symbolDescription: eventSchedule.answerSymbols.fair.description,
        onClick: () => {
          dispatch({
            type: 'header',
            icon: 'fair',
            datetimeRangeList: eventSchedule.datetimeRangeList,
          });
        },
      },
      poor: {
        symbolDescription: eventSchedule.answerSymbols.poor.description,
        onClick: () => {
          dispatch({
            type: 'header',
            icon: 'poor',
            datetimeRangeList: eventSchedule.datetimeRangeList,
          });
        },
      },
    }),
    [eventSchedule, dispatch]
  );

  const answerBeingEditedList = useMemo<
    DeepReadonly<
      {
        key: string;
        datetimeRange: DatetimeRange;
        answerSelectionValue: AnswerSelectionValue;
        buttons: Record<
          AnswerSymbolId,
          {
            description: string;
            onClick: () => void;
          }
        >;
        onPointChange: (point: AnswerSymbolPoint) => void;
      }[]
    >
  >(
    () =>
      eventSchedule.datetimeRangeList.map(
        (d) =>
          ({
            key: datetimeRange2str(d),
            datetimeRange: d,
            answerSelectionValue: answerSelectionMap.get(d) ?? {
              iconId: 'none',
              point: 0,
            },
            buttons: {
              good: {
                description: eventSchedule.answerSymbols.good.description,
                onClick: () => {
                  dispatch({
                    type: 'cell-icon',
                    datetimeRange: d,
                    icon: 'good',
                  });
                },
              },
              fair: {
                description: eventSchedule.answerSymbols.fair.description,
                onClick: () => {
                  dispatch({
                    type: 'cell-icon',
                    datetimeRange: d,
                    icon: 'fair',
                  });
                },
              },
              poor: {
                description: eventSchedule.answerSymbols.poor.description,
                onClick: () => {
                  dispatch({
                    type: 'cell-icon',
                    datetimeRange: d,
                    icon: 'poor',
                  });
                },
              },
            },
            onPointChange: (point: AnswerSymbolPoint) => {
              dispatch({ type: 'cell-point', datetimeRange: d, point });
            },
          } as const)
      ),
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

  const hasUnanswered = useMemo<boolean>(
    () =>
      answerBeingEditedList.some(
        (a) => a.answerSelectionValue.iconId === 'none'
      ),
    [answerBeingEditedList]
  );

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
    hasUnanswered,
  };
};
