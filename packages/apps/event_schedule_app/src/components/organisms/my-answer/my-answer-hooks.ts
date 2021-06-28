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
  symbolHeader: readonly {
    iconId: AnswerSymbolIconId;
    symbolDescription: string;
    onClick: () => void;
  }[];
  myAnswerList: readonly {
    datetimeRange: DatetimeRange;
    selectedSymbol: AnswerSymbolIconId | undefined;
    buttons: readonly {
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
  userName !== undefined && userName === nameToOmit
    ? false
    : answers.find((a) => a.userName === userName) !== undefined;

export const useMyAnswerHooks = (
  eventSchedule: EventSchedule,
  answers: readonly Answer[],
  usernameDuplicateCheckException: UserName | undefined,
  myAnswer: Answer,
  onMyAnswerUpdate: (updater: (answer: Answer) => Answer) => void
): MyAnswerHooks => {
  const onUserNameChange = useCallback(
    (userName) => {
      onMyAnswerUpdate(() => IRecord.set(myAnswer, 'userName', userName));
    },
    [myAnswer, onMyAnswerUpdate]
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

  const [showUserNameError, onUserNameChangeLocal, onUserNameBlur] =
    useFormError(
      myAnswer.userName,
      (v) =>
        v === '' ||
        theNameIsAlreadyUsedFn(v, answers, usernameDuplicateCheckException),
      onUserNameChange
    );

  const onCommentChange = useCallback(
    (comment) => {
      onMyAnswerUpdate(() => IRecord.set(myAnswer, 'comment', comment));
    },
    [myAnswer, onMyAnswerUpdate]
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
        IList.map(myAnswer.selection, (s) => ituple(s.datetimeRange, s.iconId)),
        datetimeRangeToMapKey,
        datetimeRangeFromMapKey
      ),
    [myAnswer.selection]
  );

  const dispatch = useCallback(
    (action: AnswerSelectionReducerAction) => {
      const nextAnswerSelectionMap = answerSelectionReducer(
        answerSelectionMap,
        action
      );
      const next: Answer = IRecord.set(
        myAnswer,
        'selection',
        nextAnswerSelectionMap
          .map((s, d) => ({
            datetimeRange: d,
            iconId: s,
          }))
          .toValuesArray()
      );
      onMyAnswerUpdate(() => next);
    },
    [answerSelectionMap, myAnswer, onMyAnswerUpdate]
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
      onMyAnswerUpdate(() => IRecord.set(myAnswer, 'weight', weight));
    },
    [myAnswer, onMyAnswerUpdate]
  );

  const toggleWeightSection = useCallback(() => {
    onMyAnswerUpdate(
      (ans) =>
        pipe(ans)
          .chain((a) => IRecord.update(a, 'useWeight', (b) => !b))
          .chain((a) =>
            a.useWeight ? a : IRecord.set(a, 'weight', createWeight(1))
          ).value
    );
  }, [onMyAnswerUpdate]);

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
