import type {
  Answer,
  AnswerIconId,
  AnswerIconPoint,
  DatetimeRange,
  EventSchedule,
  UserName,
  Weight,
} from '@noshiro/event-schedule-app-shared';
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
import { useUser } from '../../store';
import type { AnswerSelectionValue } from '../../types';
import { useFormError } from '../use-form-error-hook';

type AnswerBeingEditedHooks = DeepReadonly<{
  showUserNameError: boolean;
  theNameIsAlreadyUsed: boolean;
  onUserNameBlur: () => void;
  onUserNameChange: (v: UserName) => void;
  onCommentChange: (v: string) => void;
  iconHeader: Record<
    AnswerIconId,
    {
      iconDescription: string;
      onClick: () => void;
    }
  >;
  answerBeingEditedList: {
    key: string;
    datetimeRange: DatetimeRange;
    answerSelectionValue: AnswerSelectionValue;
    buttons: Record<
      AnswerIconId,
      {
        description: string;
        onClick: () => void;
      }
    >;
    onPointChange: (point: AnswerIconPoint) => void;
  }[];
  onWeightChange: (v: Weight) => void;
  toggleRequiredSection: () => void;
  toggleProtectedSection: () => void;
  hasUnanswered: boolean;
}>;

const theNameIsAlreadyUsedFn = (
  userName: UserName,
  answers: readonly Answer[],
  nameToOmit: UserName | undefined
): boolean =>
  userName === nameToOmit
    ? false
    : answers.some((a) => a.user.name === userName);

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
    (userName: string) => {
      updateAnswerBeingEdited(() =>
        IRecord.setIn(answerBeingEdited, ['user', 'name'], userName)
      );
    },
    [answerBeingEdited, updateAnswerBeingEdited]
  );

  const theNameIsAlreadyUsed: boolean = useMemo(
    () =>
      theNameIsAlreadyUsedFn(
        answerBeingEdited.user.name,
        answers,
        selectedAnswerUserName
      ),
    [answers, answerBeingEdited, selectedAnswerUserName]
  );

  const [showUserNameError, onUserNameChangeLocal, onUserNameBlur] =
    useFormError(
      answerBeingEdited.user.name,
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

  const iconHeader = useMemo<
    DeepReadonly<
      Record<
        AnswerIconId,
        {
          iconDescription: string;
          onClick: () => void;
        }
      >
    >
  >(
    () => ({
      good: {
        iconDescription: eventSchedule.answerIcons.good.description,
        onClick: () => {
          dispatch({
            type: 'header',
            icon: 'good',
            datetimeRangeList: eventSchedule.datetimeRangeList,
          });
        },
      },
      fair: {
        iconDescription: eventSchedule.answerIcons.fair.description,
        onClick: () => {
          dispatch({
            type: 'header',
            icon: 'fair',
            datetimeRangeList: eventSchedule.datetimeRangeList,
          });
        },
      },
      poor: {
        iconDescription: eventSchedule.answerIcons.poor.description,
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
          AnswerIconId,
          {
            description: string;
            onClick: () => void;
          }
        >;
        onPointChange: (point: AnswerIconPoint) => void;
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
                description: eventSchedule.answerIcons.good.description,
                onClick: () => {
                  dispatch({
                    type: 'cell-icon',
                    datetimeRange: d,
                    icon: 'good',
                  });
                },
              },
              fair: {
                description: eventSchedule.answerIcons.fair.description,
                onClick: () => {
                  dispatch({
                    type: 'cell-icon',
                    datetimeRange: d,
                    icon: 'fair',
                  });
                },
              },
              poor: {
                description: eventSchedule.answerIcons.poor.description,
                onClick: () => {
                  dispatch({
                    type: 'cell-icon',
                    datetimeRange: d,
                    icon: 'poor',
                  });
                },
              },
            },
            onPointChange: (point: AnswerIconPoint) => {
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

  const user = useUser();

  const toggleProtectedSection = useCallback(() => {
    updateAnswerBeingEdited((ans) =>
      IRecord.set(
        ans,
        'user',
        IRecord.update(ans.user, 'id', (uid) =>
          uid === null ? user?.uid ?? null : null
        )
      )
    );
  }, [user, updateAnswerBeingEdited]);

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
    iconHeader,
    answerBeingEditedList,
    onWeightChange,
    toggleRequiredSection,
    toggleProtectedSection,
    hasUnanswered,
  };
};
