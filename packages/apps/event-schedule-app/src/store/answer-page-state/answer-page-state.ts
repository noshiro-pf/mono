import {
  answerDefaultValue,
  compareYmdhm,
} from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import { api } from '../../api';
import { routes } from '../../constants';
import type {
  AnswerSelectionReducerAction,
  CalendarCurrentPageReducerState,
} from '../../functions';
import {
  answerSelectionReducer,
  createToaster,
  datetimeRange2str,
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
  now,
  showToast,
  theNameIsAlreadyUsedFn,
} from '../../functions';
import type { AnswerSelectionValue } from '../../types';
import { fireAuthUser$ } from '../auth';
import { answers$, AnswersFetchState, eventSchedule$ } from '../fetch-state';
import { router } from '../router';

const toast = createToaster();

/* states */

const { state$: selectedAnswerSaved$, setState: setSelectedAnswerSaved } =
  createState<Answer | undefined>(undefined);

const { state$: submitButtonIsLoading$, setState: setSubmitButtonIsLoading } =
  createState<boolean>(false);

const {
  state$: alertOnAnswerClickIsOpen$,
  setTrue: openAlertOnAnswerClick,
  setFalse: closeAlertOnAnswerClick,
} = createBooleanState(false);

const {
  state$: answerBeingEditedSectionState$,
  setState: _setAnswerBeingEditedSectionState,
} = createState<'creating' | 'editing' | 'hidden'>('hidden');

const {
  state$: answerBeingEdited$,
  setState: setAnswerBeingEdited,
  updateState: updateAnswerBeingEdited,
} = createState(answerDefaultValue);

const setAnswerBeingEditedSectionState = (
  nextState: 'creating' | 'editing' | 'hidden'
): void => {
  _setAnswerBeingEditedSectionState(nextState);

  // 回答追加開始時にデフォルトで「回答を保護する」を有効にする
  if (nextState === 'creating') {
    const user = mut_subscribedValues.user;

    updateAnswerBeingEdited((ans) =>
      IRecord.set(ans, 'user', IRecord.set(ans.user, 'id', user?.uid ?? null))
    );
  }
};

const [resetAnswerBeingEditedAction$, resetAnswerBeingEdited] =
  createVoidEventEmitter();

/* mapped values */

const selectedAnswerUserName$ = selectedAnswerSaved$.chain(
  mapI((selectedAnswerSaved) => selectedAnswerSaved?.user.name)
);

const requiredParticipantsExist$: InitializedObservable<boolean> =
  answers$.chain(
    mapI((answers) => answers?.some((a) => a.isRequiredParticipants) === true)
  );

const selectedDates$: InitializedObservable<readonly YearMonthDate[]> =
  eventSchedule$.chain(
    mapI(
      (eventSchedule) =>
        eventSchedule?.datetimeRangeList.map((d) => d.ymd) ?? []
    )
  );

const setYearMonth$: Observable<CalendarCurrentPageReducerState> =
  selectedDates$
    .chain(
      map((selectedDates) =>
        IList.isNonEmpty(selectedDates) ? selectedDates[0] : undefined
      )
    )
    .chain(filter(isNotUndefined));

const isStateAfterDeadline$: InitializedObservable<boolean> =
  eventSchedule$.chain(
    mapI((eventSchedule) =>
      eventSchedule === undefined
        ? false
        : eventSchedule.answerDeadline !== 'none' &&
          compareYmdhm(now(), eventSchedule.answerDeadline) >= 0
    )
  );

const emptyAnswerSelection$: InitializedObservable<Answer> = eventSchedule$
  .chain(filter(isNotUndefined))
  .chain(
    map((e) =>
      IRecord.set(
        answerDefaultValue,
        'selection',
        e.datetimeRangeList.map(
          (d) =>
            ({
              datetimeRange: d,
              iconId: 'none',
              point: 0,
              comment: '',
            } as const)
        )
      )
    )
  )
  .chain(distinctUntilChanged(deepEqual))
  .chain(withInitialValue(answerDefaultValue));

const theNameIsAlreadyUsed$: InitializedObservable<boolean> = combineLatestI([
  answers$,
  answerBeingEdited$,
  selectedAnswerUserName$,
]).chain(
  mapI(([answers, answerBeingEdited, selectedAnswerUserName]) =>
    theNameIsAlreadyUsedFn(
      answerBeingEdited.user.name,
      answers ?? [],
      selectedAnswerUserName
    )
  )
);

const submitButtonIsDisabled$: InitializedObservable<boolean> = combineLatestI([
  answerBeingEdited$,
  selectedAnswerSaved$,
  theNameIsAlreadyUsed$,
]).chain(
  mapI(
    ([answerBeingEdited, selectedAnswerSaved, theNameIsAlreadyUsed]) =>
      answerBeingEdited.user.name === '' ||
      deepEqual(selectedAnswerSaved, answerBeingEdited) ||
      theNameIsAlreadyUsed
  )
);

const answerSelectionMap$: InitializedObservable<
  IMapMapped<DatetimeRange, AnswerSelectionValue, DatetimeRangeMapKey>
> = combineLatestI([
  answerBeingEdited$.chain(pluckI('selection')),
  eventSchedule$
    .chain(filter(isNotUndefined))
    .chain(pluck('datetimeRangeList'))
    .chain(withInitialValue<readonly DatetimeRange[]>([])),
]).chain(
  mapI(([selection, datetimeRangeList]) => {
    const entries: DeepReadonly<[DatetimeRange, AnswerSelectionValue][]> =
      IList.concat(
        datetimeRangeList.map((d) => [
          d,
          { iconId: 'none', point: 0, comment: '' } as const,
        ]),
        selection.map((s) => [s.datetimeRange, s])
      );

    return IMapMapped.new<
      DatetimeRange,
      AnswerSelectionValue,
      DatetimeRangeMapKey
    >(entries, datetimeRangeToMapKey, datetimeRangeFromMapKey);
  })
);

/* callbacks */

const clearAnswerBeingEditedFields = (): void => {
  resetAnswerBeingEdited();
  setSelectedAnswerSaved(undefined);
};

const onCancelEditingAnswer = (): void => {
  clearAnswerBeingEditedFields();
  setAnswerBeingEditedSectionState('hidden');
};

const onUserNameChange = (userName: string): void => {
  updateAnswerBeingEdited((answerBeingEdited) =>
    IRecord.setIn(answerBeingEdited, ['user', 'name'], userName)
  );
};

const onCommentChange = (comment: string): void => {
  updateAnswerBeingEdited((answerBeingEdited) =>
    IRecord.set(answerBeingEdited, 'comment', comment)
  );
};

const onWeightChange = (weight: Weight): void => {
  updateAnswerBeingEdited((answerBeingEdited) =>
    IRecord.set(answerBeingEdited, 'weight', weight)
  );
};

const toggleRequiredSection = (): void => {
  updateAnswerBeingEdited((answerBeingEdited) =>
    IRecord.update(answerBeingEdited, 'isRequiredParticipants', (b) => !b)
  );
};

/* callbacks impl */

/* @internal */
const onAnswerClickImpl = (
  answer: Answer,
  user: FireAuthUser | undefined
): void => {
  // ログインユーザーの回答は本人のみ編集可能にする
  if (answer.user.id !== null && answer.user.id !== user?.uid) {
    openAlertOnAnswerClick();
  } else {
    setAnswerBeingEditedSectionState('editing');
    setAnswerBeingEdited(answer);
    setSelectedAnswerSaved(answer);
  }
};

/* @internal */
const onAddAnswerButtonClickImpl = (user: FireAuthUser | undefined): void => {
  clearAnswerBeingEditedFields();
  setAnswerBeingEditedSectionState('creating');
  // automatically set username with user.displayName
  updateAnswerBeingEdited((prev) =>
    IRecord.setIn(prev, ['user', 'name'], user?.displayName ?? '')
  );
};

/* @internal */
const onSubmitAnswerImpl = async (
  eventId: string | undefined,
  answerBeingEdited: Answer,
  answerBeingEditedSectionState: 'creating' | 'editing' | 'hidden'
): Promise<void> => {
  if (eventId === undefined) return;

  setSubmitButtonIsLoading(true);

  switch (answerBeingEditedSectionState) {
    case 'creating':
      await api.answers
        .add(eventId, IRecord.set(answerBeingEdited, 'createdAt', IDate.now()))
        .then((res) => {
          if (Result.isErr(res)) {
            console.error(res.value);
          }

          setSubmitButtonIsLoading(false);
          setAnswerBeingEditedSectionState('hidden');
          AnswersFetchState.fetchAnswers();
          clearAnswerBeingEditedFields();
          showToast({
            toast,
            message:
              dict.answerPage.answerBeingEdited.submitButton
                .createAnswerResultMessage,
            intent: 'success',
          });
        });
      break;

    case 'editing':
      await api.answers
        .update(eventId, answerBeingEdited.id, answerBeingEdited)
        .then((res) => {
          if (Result.isErr(res)) {
            console.error(res.value);
          }
          setSubmitButtonIsLoading(false);
          setAnswerBeingEditedSectionState('hidden');
          AnswersFetchState.fetchAnswers();
          clearAnswerBeingEditedFields();
          showToast({
            toast,
            message:
              dict.answerPage.answerBeingEdited.submitButton
                .updateAnswerResultMessage,
            intent: 'success',
          });
        });
      break;
    case 'hidden':
      break;
  }
};

/* @internal */
const onSubmitEmptyAnswerImpl = async (
  eventId: string | undefined,
  user: FireAuthUser | undefined
): Promise<void> => {
  if (eventId === undefined) return;
  if (user === undefined) return;

  setSubmitButtonIsLoading(true);

  await api.answers
    .add(
      eventId,
      pipe(answerDefaultValue)
        .chain((a) => IRecord.set(a, 'createdAt', IDate.now()))
        .chain((a) =>
          IRecord.set(a, 'user', {
            id: user.uid,
            name: user.displayName ?? '',
          })
        ).value
    )
    .then((res) => {
      if (Result.isErr(res)) {
        console.error(res.value);
      }

      setSubmitButtonIsLoading(false);
      setAnswerBeingEditedSectionState('hidden');
      AnswersFetchState.fetchAnswers();
      clearAnswerBeingEditedFields();
      showToast({
        toast,
        message: dict.answerPage.answerLater.result.success,
        intent: 'success',
      });
    });
};

/* @internal */
const onDeleteAnswerImpl = async (
  eventId: string | undefined,
  answerBeingEdited: Answer
): Promise<void> => {
  if (eventId === undefined) return;

  setSubmitButtonIsLoading(true);

  await api.answers.delete(eventId, answerBeingEdited.id).then((res) => {
    if (Result.isErr(res)) {
      console.error(res.value);
    }
    setSubmitButtonIsLoading(false);
    setAnswerBeingEditedSectionState('hidden');
    AnswersFetchState.fetchAnswers();
    clearAnswerBeingEditedFields();
  });
};

/* @internal */
const onEditButtonClickImpl = (eventId: string | undefined): void => {
  if (eventId !== undefined) {
    router.push(routes.editPage(eventId));
  }
};

/* @internal */
const answerBeingEditedDispatchImpl = (
  action: AnswerSelectionReducerAction,
  answerSelectionMap: IMapMapped<
    DatetimeRange,
    AnswerSelectionValue,
    DatetimeRangeMapKey
  >
): void => {
  const nextAnswerSelectionMap = answerSelectionReducer(
    answerSelectionMap,
    action
  );

  updateAnswerBeingEdited((answerBeingEdited) =>
    IRecord.set(
      answerBeingEdited,
      'selection',
      nextAnswerSelectionMap
        .map((s, d) => ({ datetimeRange: d, ...s }))
        .toValuesArray()
    )
  );
};

const toggleProtectedSectionImpl = (user: FireAuthUser | undefined): void => {
  updateAnswerBeingEdited((ans) =>
    IRecord.set(
      ans,
      'user',
      IRecord.update(ans.user, 'id', (uid) =>
        uid === null ? user?.uid ?? null : null
      )
    )
  );
};

/* subscriptions */

combineLatest([emptyAnswerSelection$, resetAnswerBeingEditedAction$] as const)
  .chain(map(([x, _]) => x))
  .subscribe(setAnswerBeingEdited);

/* subscribe values */

const answerSelectionMapDefaultValue = IMapMapped.new<
  DatetimeRange,
  AnswerSelectionValue,
  DatetimeRangeMapKey
>([], datetimeRangeToMapKey, datetimeRangeFromMapKey);

const mut_subscribedValues: {
  eventId: string | undefined;
  answerBeingEdited: Answer;
  answerBeingEditedSectionState: 'creating' | 'editing' | 'hidden';
  user: FireAuthUser | undefined;
  answerSelectionMap: IMapMapped<
    DatetimeRange,
    AnswerSelectionValue,
    DatetimeRangeMapKey
  >;
} = {
  eventId: undefined,
  answerBeingEdited: answerDefaultValue,
  answerBeingEditedSectionState: 'hidden',
  user: undefined,
  answerSelectionMap: answerSelectionMapDefaultValue,
};

router.eventId$.subscribe((id) => {
  mut_subscribedValues.eventId = id;
});

answerBeingEdited$.subscribe((v) => {
  mut_subscribedValues.answerBeingEdited = v;
});

answerBeingEditedSectionState$.subscribe((v) => {
  mut_subscribedValues.answerBeingEditedSectionState = v;
});

fireAuthUser$.subscribe((u) => {
  mut_subscribedValues.user = u;
});

answerSelectionMap$.subscribe((u) => {
  mut_subscribedValues.answerSelectionMap = u;
});

/* callbacks using subscribed values */

const onAnswerClick = (answer: Answer): void => {
  onAnswerClickImpl(answer, mut_subscribedValues.user);
};

const onAddAnswerButtonClick = (): void => {
  onAddAnswerButtonClickImpl(mut_subscribedValues.user);
};

const onEditButtonClick = (): void => {
  onEditButtonClickImpl(mut_subscribedValues.eventId);
};

const onSubmitAnswer = (): Promise<void> =>
  onSubmitAnswerImpl(
    mut_subscribedValues.eventId,
    mut_subscribedValues.answerBeingEdited,
    mut_subscribedValues.answerBeingEditedSectionState
  );

const onSubmitEmptyAnswer = (): Promise<void> =>
  onSubmitEmptyAnswerImpl(
    mut_subscribedValues.eventId,
    mut_subscribedValues.user
  );

const onSubmitAnswerClick = (): void => {
  onSubmitAnswer().catch(noop);
};

const onSubmitEmptyAnswerClick = (): void => {
  onSubmitEmptyAnswer().catch(noop);
};

const onDeleteAnswer = (): Promise<void> =>
  onDeleteAnswerImpl(
    mut_subscribedValues.eventId,
    mut_subscribedValues.answerBeingEdited
  );

const answerBeingEditedDispatch = (
  action: AnswerSelectionReducerAction
): void => {
  answerBeingEditedDispatchImpl(
    action,
    mut_subscribedValues.answerSelectionMap
  );
};

const toggleProtectedSection = (): void => {
  toggleProtectedSectionImpl(mut_subscribedValues.user);
};

/* combined values */

const iconHeader$: InitializedObservable<
  | DeepReadonly<
      Record<
        AnswerIconId,
        {
          iconDescription: string;
          onClick: () => void;
        }
      >
    >
  | undefined
> = eventSchedule$.chain(
  mapI((e) =>
    mapNullable(e, (eventSchedule) => ({
      good: {
        iconDescription: eventSchedule.answerIcons.good.description,
        onClick: () => {
          answerBeingEditedDispatch({
            type: 'header',
            icon: 'good',
            datetimeRangeList: eventSchedule.datetimeRangeList,
          });
        },
      },
      fair: {
        iconDescription: eventSchedule.answerIcons.fair.description,
        onClick: () => {
          answerBeingEditedDispatch({
            type: 'header',
            icon: 'fair',
            datetimeRangeList: eventSchedule.datetimeRangeList,
          });
        },
      },
      poor: {
        iconDescription: eventSchedule.answerIcons.poor.description,
        onClick: () => {
          answerBeingEditedDispatch({
            type: 'header',
            icon: 'poor',
            datetimeRangeList: eventSchedule.datetimeRangeList,
          });
        },
      },
    }))
  )
);

const answerBeingEditedList$: InitializedObservable<
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
      onCommentChange: (comment: string) => void;
    }[]
  >
> = combineLatestI([eventSchedule$, answerSelectionMap$]).chain(
  mapI(
    ([e, answerSelectionMap]) =>
      mapNullable(e, (eventSchedule) =>
        eventSchedule.datetimeRangeList.map(
          (d) =>
            ({
              key: datetimeRange2str(d),
              datetimeRange: d,
              answerSelectionValue: answerSelectionMap.get(d) ?? {
                iconId: 'none',
                point: 0,
                comment: '',
              },
              buttons: {
                good: {
                  description: eventSchedule.answerIcons.good.description,
                  onClick: () => {
                    answerBeingEditedDispatch({
                      type: 'cell-icon',
                      datetimeRange: d,
                      icon: 'good',
                    });
                  },
                },
                fair: {
                  description: eventSchedule.answerIcons.fair.description,
                  onClick: () => {
                    answerBeingEditedDispatch({
                      type: 'cell-icon',
                      datetimeRange: d,
                      icon: 'fair',
                    });
                  },
                },
                poor: {
                  description: eventSchedule.answerIcons.poor.description,
                  onClick: () => {
                    answerBeingEditedDispatch({
                      type: 'cell-icon',
                      datetimeRange: d,
                      icon: 'poor',
                    });
                  },
                },
              },
              onPointChange: (point: AnswerIconPoint) => {
                answerBeingEditedDispatch({
                  type: 'cell-point',
                  datetimeRange: d,
                  point,
                });
              },
              onCommentChange: (comment: string) => {
                answerBeingEditedDispatch({
                  type: 'cell-comment',
                  datetimeRange: d,
                  comment,
                });
              },
            } as const)
        )
      ) ?? []
  )
);

const hasUnanswered$: InitializedObservable<boolean> =
  answerBeingEditedList$.chain(
    mapI((answerBeingEditedList) =>
      answerBeingEditedList.some(
        (a) => a.answerSelectionValue.iconId === 'none'
      )
    )
  );

export {
  alertOnAnswerClickIsOpen$,
  answerBeingEditedSectionState$,
  isStateAfterDeadline$,
  requiredParticipantsExist$,
  selectedAnswerUserName$,
  selectedDates$,
  setYearMonth$,
  submitButtonIsDisabled$,
  submitButtonIsLoading$,
  answerBeingEdited$,
  theNameIsAlreadyUsed$,
  answerSelectionMap$,
  iconHeader$,
  answerBeingEditedList$,
  hasUnanswered$,
  setAnswerBeingEdited,
  resetAnswerBeingEdited,
  updateAnswerBeingEdited,
  closeAlertOnAnswerClick,
  onAddAnswerButtonClick,
  onAnswerClick,
  onCancelEditingAnswer,
  onDeleteAnswer,
  onEditButtonClick,
  onSubmitAnswer,
  onSubmitAnswerClick,
  onSubmitEmptyAnswerClick,
  setSubmitButtonIsLoading,
  onUserNameChange,
  onCommentChange,
  onWeightChange,
  toggleRequiredSection,
  toggleProtectedSection,
  answerBeingEditedDispatch,
};