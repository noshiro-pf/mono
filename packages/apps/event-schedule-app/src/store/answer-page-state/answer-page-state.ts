import { Answer, UserId, UserName } from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import { api } from '../../api';
import { Routes, datetimeRange2str } from '../../constants';
import {
  answerSelectionReducer,
  createToaster,
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
  showToast,
  theNameIsAlreadyUsedFn,
  type AnswerSelectionReducerAction,
  type CalendarCurrentPageReducerState,
} from '../../functions';
import { type AnswerSelectionValue } from '../../types';
import { Auth } from '../auth';
import { AnswersStore, eventSchedule$ } from '../fetching-state';
import { Router } from '../router';

const toast = createToaster();

/* states */

const { state: selectedAnswerSavedState$, setState: setSelectedAnswerSaved } =
  createState<Answer | undefined>(undefined);

const {
  useCurrentValue: useSubmitButtonIsLoading,
  setState: setSubmitButtonIsLoading,
} = createBooleanState(false);

const {
  useCurrentValue: useAlertOnAnswerClickIsOpen,
  setTrue: openAlertOnAnswerClick,
  setFalse: closeAlertOnAnswerClick,
} = createBooleanState(false);

const {
  useCurrentValue: useAnswerBeingEditedSectionState,
  getSnapshot: getAnswerBeingEditedSectionStateSnapshot,
  setState: setAnswerBeingEditedSectionState_,
} = createState<'creating' | 'editing' | 'hidden'>('hidden');

const {
  useCurrentValue: useAnswerBeingEdited,
  state: answerBeingEdited$,
  getSnapshot: getAnswerBeingEditedSnapshot,
  setState: setAnswerBeingEdited,
  updateState: updateAnswerBeingEdited,
} = createState(Answer.defaultValue);

const setAnswerBeingEditedSectionState = (
  nextState: 'creating' | 'editing' | 'hidden',
): void => {
  setAnswerBeingEditedSectionState_(nextState);

  // 回答追加開始時にデフォルトで「回答を保護する」を有効にする
  if (nextState === 'creating') {
    const user = Auth.getFireAuthUserSnapshot();

    updateAnswerBeingEdited((ans) =>
      Obj.set(
        ans,
        'user',
        Obj.set(ans.user, 'id', mapOptional(user?.uid, UserId.cast) ?? null),
      ),
    );
  }
};

const [resetAnswerBeingEditedAction$, resetAnswerBeingEdited] =
  createVoidEventEmitter();

const {
  getSnapshot: getCheckboxesStateSnapshot,
  useCurrentValue: useCheckboxesState,
  setState: setCheckboxesState,
  updateState: updateCheckboxesState,
  resetState: resetCheckboxesState,
} = createState(
  ISetMapped.new<DatetimeRange, DatetimeRangeMapKey>(
    [],
    datetimeRangeToMapKey,
    datetimeRangeFromMapKey,
  ),
);

const {
  useCurrentValue: useBatchInputFieldIsOpen,
  toggle: toggleBatchInputField_,
} = createBooleanState(false);

const toggleBatchInputField = (): void => {
  toggleBatchInputField_();
  resetCheckboxesState();
};

/* mapped values */

const selectedAnswerUserName$ = selectedAnswerSavedState$.chain(
  map((selectedAnswerSaved) => selectedAnswerSaved?.user.name),
);

const requiredParticipantsExist$: InitializedObservable<boolean> =
  AnswersStore.answers$.chain(
    map((answers) => answers?.some((a) => a.isRequiredParticipants) === true),
  );

const selectedDates$: InitializedObservable<readonly YearMonthDate[]> =
  eventSchedule$.chain(
    map(
      (eventSchedule) =>
        eventSchedule?.datetimeRangeList.map((d) => d.ymd) ?? [],
    ),
  );

const setYearMonth$: Observable<CalendarCurrentPageReducerState> =
  selectedDates$
    .chain(
      map((selectedDates) =>
        Arr.isNonEmpty(selectedDates) ? selectedDates[0] : undefined,
      ),
    )
    .chain(filter(isNotUndefined));

const emptyAnswerSelection$: InitializedObservable<Answer> = eventSchedule$
  .chain(filter(isNotUndefined))
  .chain(
    map((e) =>
      Obj.set(
        Answer.defaultValue,
        'selection',
        e.datetimeRangeList.map(
          (d) =>
            ({
              datetimeRange: d,
              iconId: 'none',
              point: 0,
              comment: '',
            }) as const,
        ),
      ),
    ),
  )
  .chain(skipIfNoChange(deepEqual))
  .chain(setInitialValue(Answer.defaultValue));

const theNameIsAlreadyUsed$: InitializedObservable<boolean> = combine([
  AnswersStore.answers$,
  answerBeingEdited$,
  selectedAnswerUserName$,
]).chain(
  map(([answers, answerBeingEdited, selectedAnswerUserName]) =>
    theNameIsAlreadyUsedFn(
      answerBeingEdited.user.name,
      answers ?? [],
      selectedAnswerUserName,
    ),
  ),
);

const submitButtonIsDisabled$: InitializedObservable<boolean> = combine([
  answerBeingEdited$,
  selectedAnswerSavedState$,
  theNameIsAlreadyUsed$,
]).chain(
  map(
    ([answerBeingEdited, selectedAnswerSaved, theNameIsAlreadyUsed]) =>
      answerBeingEdited.user.name === '' ||
      deepEqual(selectedAnswerSaved, answerBeingEdited) ||
      theNameIsAlreadyUsed,
  ),
);

const answerSelectionMap$: InitializedObservable<
  IMapMapped<DatetimeRange, AnswerSelectionValue, DatetimeRangeMapKey>
> = combine([
  answerBeingEdited$,
  eventSchedule$
    .chain(filter(isNotUndefined))
    .chain(pluck('datetimeRangeList'))
    .chain(setInitialValue<readonly DatetimeRange[]>([])),
]).chain(
  map(([{ selection }, datetimeRangeList]) => {
    const entries: DeepReadonly<[DatetimeRange, AnswerSelectionValue][]> =
      Arr.concat(
        datetimeRangeList.map((d) => [
          d,
          { iconId: 'none', point: 0, comment: '' } as const,
        ]),
        selection.map((s) => [s.datetimeRange, s]),
      );

    return IMapMapped.new<
      DatetimeRange,
      AnswerSelectionValue,
      DatetimeRangeMapKey
    >(entries, datetimeRangeToMapKey, datetimeRangeFromMapKey);
  }),
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

const onUserNameChange = (userName: UserName): void => {
  updateAnswerBeingEdited((answerBeingEdited) =>
    Obj.setIn(answerBeingEdited, ['user', 'name'], userName),
  );
};

const onCommentChange = (comment: string): void => {
  updateAnswerBeingEdited((answerBeingEdited) =>
    Obj.set(answerBeingEdited, 'comment', comment),
  );
};

const onWeightChange = (weight: Weight): void => {
  updateAnswerBeingEdited((answerBeingEdited) =>
    Obj.set(answerBeingEdited, 'weight', weight),
  );
};

const toggleRequiredSection = (): void => {
  updateAnswerBeingEdited((answerBeingEdited) =>
    Obj.update(answerBeingEdited, 'isRequiredParticipants', (b) => !b),
  );
};

/* callbacks impl */

/* @internal */
const onAnswerClickImpl = (
  answer: Answer,
  user: FireAuthUser | undefined,
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
    Obj.setIn(prev, ['user', 'name'], UserName.cast(user?.displayName ?? '')),
  );
};

/* @internal */
const onSubmitAnswerImpl = async (
  eventId: string | undefined,
  answerBeingEdited: Answer,
  answerBeingEditedSection: 'creating' | 'editing' | 'hidden',
): Promise<void> => {
  if (eventId === undefined) return;

  setSubmitButtonIsLoading(true);

  switch (answerBeingEditedSection) {
    case 'creating':
      await api.answers
        .add(eventId, Obj.set(answerBeingEdited, 'createdAt', DateUtils.now()))
        .then((res) => {
          if (Result.isErr(res)) {
            // TODO: use toast
            console.error(res.value);
          }

          setSubmitButtonIsLoading(false);
          setAnswerBeingEditedSectionState('hidden');
          AnswersStore.fetchAnswers();
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
            // TODO: use toast
            console.error(res.value);
          }
          setSubmitButtonIsLoading(false);
          setAnswerBeingEditedSectionState('hidden');
          AnswersStore.fetchAnswers();
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
  fireAuthUser: FireAuthUser | undefined,
): Promise<void> => {
  if (eventId === undefined) return;
  if (fireAuthUser === undefined) return;

  setSubmitButtonIsLoading(true);

  await api.answers
    .add(
      eventId,
      pipe(Answer.defaultValue)
        .chain((a) => Obj.set(a, 'createdAt', DateUtils.now()))
        .chain((a) =>
          Obj.set(a, 'user', {
            id: UserId.cast(fireAuthUser.uid),
            name: UserName.cast(fireAuthUser.displayName ?? ''),
          }),
        ).value,
    )
    .then((res) => {
      if (Result.isErr(res)) {
        // TODO: use toast
        console.error(res.value);
      }

      setSubmitButtonIsLoading(false);
      setAnswerBeingEditedSectionState('hidden');
      AnswersStore.fetchAnswers();
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
  answerBeingEdited: Answer,
): Promise<void> => {
  if (eventId === undefined) return;

  setSubmitButtonIsLoading(true);

  await api.answers.delete(eventId, answerBeingEdited.id).then((res) => {
    if (Result.isErr(res)) {
      // TODO: use toast
      console.error(res.value);
    }
    setSubmitButtonIsLoading(false);
    setAnswerBeingEditedSectionState('hidden');
    AnswersStore.fetchAnswers();
    clearAnswerBeingEditedFields();
  });
};

/* @internal */
const onEditButtonClickImpl = (eventId: string | undefined): void => {
  if (eventId !== undefined) {
    Router.push(Routes.routes.editPage(eventId));
  }
};

/* @internal */
const answerBeingEditedDispatch = (
  action: AnswerSelectionReducerAction,
): void => {
  updateAnswerBeingEdited((answerBeingEdited) =>
    Obj.set(
      answerBeingEdited,
      'selection',
      answerSelectionReducer(
        IMapMapped.new<
          DatetimeRange,
          AnswerSelectionValue,
          DatetimeRangeMapKey
        >(
          answerBeingEdited.selection.map((s) => [s.datetimeRange, s]),
          datetimeRangeToMapKey,
          datetimeRangeFromMapKey,
        ),
        action,
      )
        .map((s, d) => ({ datetimeRange: d, ...s }))
        .toValuesArray(),
    ),
  );
};

const toggleProtectedSectionImpl = (user: FireAuthUser | undefined): void => {
  updateAnswerBeingEdited((ans) =>
    Obj.set(
      ans,
      'user',
      Obj.update(ans.user, 'id', (uid) =>
        uid === null ? (mapOptional(user?.uid, UserId.cast) ?? null) : null,
      ),
    ),
  );
};

/* subscriptions */

combine([emptyAnswerSelection$, resetAnswerBeingEditedAction$])
  .chain(map(([x, _]) => x))
  .subscribe(setAnswerBeingEdited);

/* callbacks using subscribed values */

const onAnswerClick = (answer: Answer): void => {
  onAnswerClickImpl(answer, Auth.getFireAuthUserSnapshot());
};

const onAddAnswerButtonClick = (): void => {
  onAddAnswerButtonClickImpl(Auth.getFireAuthUserSnapshot());
};

const onEditButtonClick = (): void => {
  onEditButtonClickImpl(Router.eventId$.getSnapshot().value);
};

const onSubmitAnswerClickPromise = (): Promise<void> =>
  onSubmitAnswerImpl(
    Router.eventId$.getSnapshot().value,
    getAnswerBeingEditedSnapshot(),
    getAnswerBeingEditedSectionStateSnapshot(),
  );

const onSubmitAnswerClick = (): void => {
  onSubmitAnswerImpl(
    Router.eventId$.getSnapshot().value,
    getAnswerBeingEditedSnapshot(),
    getAnswerBeingEditedSectionStateSnapshot(),
  ).catch(noop);
};

const onSubmitEmptyAnswerClick = (): Promise<void> =>
  onSubmitEmptyAnswerImpl(
    Router.eventId$.getSnapshot().value,
    Auth.getFireAuthUserSnapshot(),
  );

const onDeleteAnswerClick = (): Promise<void> =>
  onDeleteAnswerImpl(
    Router.eventId$.getSnapshot().value,
    getAnswerBeingEditedSnapshot(),
  );

const toggleProtectedSection = (): void => {
  toggleProtectedSectionImpl(Auth.getFireAuthUserSnapshot());
};

const applyBatchInput = ({
  comment,
  selectedIconId,
  point,
}: Readonly<{
  comment: string;
  selectedIconId: AnswerIconIdWithNone;
  point: AnswerIconPoint;
}>): void => {
  answerBeingEditedDispatch({
    type: 'batch-input',
    comment,
    selectedIconId,
    point,
    checkboxState: getCheckboxesStateSnapshot(),
  });
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
  map((e) =>
    mapOptional(e, (eventSchedule) => ({
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
    })),
  ),
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
      onCheck: (checked: boolean) => void;
    }[]
  >
> = combine([eventSchedule$, answerSelectionMap$]).chain(
  map(
    ([e, answerSelectionMap]) =>
      mapOptional(e, (eventSchedule) =>
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
              onCheck: (checked: boolean) => {
                updateCheckboxesState((set) =>
                  checked ? set.add(d) : set.delete(d),
                );
              },
            }) as const,
        ),
      ) ?? [],
  ),
);

const onCheckAll = (checked: boolean): void => {
  const dates = eventSchedule$.getSnapshot().value?.datetimeRangeList ?? [];

  if (checked) {
    setCheckboxesState(
      ISetMapped.new<DatetimeRange, DatetimeRangeMapKey>(
        dates,
        datetimeRangeToMapKey,
        datetimeRangeFromMapKey,
      ),
    );
  } else {
    resetCheckboxesState();
  }
};

const hasUnanswered$: InitializedObservable<boolean> =
  answerBeingEditedList$.chain(
    map((answerBeingEditedList) =>
      answerBeingEditedList.some(
        (a) => a.answerSelectionValue.iconId === 'none',
      ),
    ),
  );

export const AnswerPageStore = {
  useAlertOnAnswerClickIsOpen,
  useAnswerBeingEdited,
  answerBeingEditedList$,
  useAnswerBeingEditedSectionState,
  hasUnanswered$,
  iconHeader$,
  requiredParticipantsExist$,
  selectedAnswerUserName$,
  selectedDates$,
  setYearMonth$,
  submitButtonIsDisabled$,
  useSubmitButtonIsLoading,
  theNameIsAlreadyUsed$,
  useCheckboxesState,
  useBatchInputFieldIsOpen,
  closeAlertOnAnswerClick,
  onAddAnswerButtonClick,
  onAnswerClick,
  onCancelEditingAnswer,
  onCommentChange,
  onDeleteAnswerClick,
  onEditButtonClick,
  onSubmitAnswerClick,
  onSubmitAnswerClickPromise,
  onSubmitEmptyAnswerClick,
  onUserNameChange,
  onWeightChange,
  toggleProtectedSection,
  toggleRequiredSection,
  applyBatchInput,
  toggleBatchInputField,
  onCheckAll,
} as const;
