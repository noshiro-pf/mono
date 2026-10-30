import type { Toaster } from '@blueprintjs/core';
import { Answer, UserId, UserName } from 'event-schedule-app-shared';
import {
  combine,
  createEventEmitter,
  createState as createStateBase,
  filter,
  map,
  pluck,
  skipIfNoChange,
  withInitialValue,
  type InitializedObservable,
  type Observable as SynstateObservable,
} from 'synstate';
import { createBooleanState, createState } from 'synstate-react-hooks';
import {
  Arr,
  IMapMapped,
  ISetMapped,
  Optional,
  Result,
  fastDeepEqual,
  isNotUndefined,
  mapNullable,
  pipe,
} from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import type { DeepReadonly, ReadonlyRecord, StrictPick } from 'ts-type-forge';
import type { Api } from '../../api/index.mjs';
import { Routes, datetimeRange2str, dict } from '../../constants/index.mjs';
import {
  answerSelectionReducer,
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
  showToast,
  theNameIsAlreadyUsedFn,
  type AnswerSelectionReducerAction,
  type CalendarCurrentPageReducerState,
} from '../../functions/index.mjs';
import type { AnswerSelectionValue } from '../../types/index.mjs';
import { Obj } from '../../utils-ported/index.mjs';
import { createReducerWithActions } from '../../utils/index.mjs';
import type { AnswersFetcher } from '../fetching-state/index.mjs';
import type { AppRouter } from '../router-store.mjs';

export type AnswerPageDeps = Readonly<{
  api: Readonly<{
    answers: StrictPick<Api['answers'], 'add' | 'delete' | 'update'>;
  }>;
  answers: StrictPick<AnswersFetcher, 'answers$' | 'refetchAnswersAfterWrite'>;
  auth: Readonly<{ getFireAuthUserSnapshot: () => SignedInUser | undefined }>;
  router: StrictPick<AppRouter, 'eventId$' | 'push'>;
  eventSchedule$: InitializedObservable<EventSchedule | undefined>;
  /** Where the page says that an answer was saved. */
  toast: Promise<Toaster>;
}>;

/**
 * The answer page: the answer being written, its sections and buttons, and
 * saving or deleting it through `deps.api`.
 */
export const createAnswerPageStore = (deps: AnswerPageDeps): AnswerPage => {
  /* states */

  const [selectedAnswerSavedState$, setSelectedAnswerSaved] = createStateBase<
    Answer | undefined
  >(undefined);

  const [useSubmitButtonIsLoading, { setState: setSubmitButtonIsLoading }] =
    createBooleanState(false);

  const [
    useAlertOnAnswerClickIsOpen,
    { setTrue: openAlertOnAnswerClick, setFalse: closeAlertOnAnswerClick },
  ] = createBooleanState(false);

  const [
    useAnswerBeingEditedSectionState,
    setAnswerBeingEditedSectionState_,
    {
      state: answerBeingEditedSectionState$,
      getSnapshot: getAnswerBeingEditedSectionStateSnapshot,
    },
  ] = createState<'creating' | 'editing' | 'hidden'>('hidden');

  const emptyAnswerSelection$: InitializedObservable<Answer> =
    deps.eventSchedule$
      .pipe(filter(isNotUndefined))
      .pipe(
        map((e) => ({
          ...Answer.defaultValue,
          selection: e.datetimeRangeList.map(
            (d) =>
              ({
                datetimeRange: d,
                iconId: 'none',
                point: 0,
                comment: '',
              }) as const,
          ),
        })),
      )
      .pipe(skipIfNoChange(fastDeepEqual))
      .pipe(withInitialValue(Answer.defaultValue));

  const [resetAnswerBeingEditedAction$, resetAnswerBeingEdited] =
    createEventEmitter();

  const [
    useAnswerBeingEdited,
    updateAnswerBeingEdited,
    { state: answerBeingEdited$, getSnapshot: getAnswerBeingEditedSnapshot },
  ] = createReducerWithActions(
    (answer: Answer, update: (prev: Answer) => Answer) => update(answer),
    Answer.defaultValue,
    [
      // Cleared to the event's empty answer by `resetAnswerBeingEdited`, and
      // again whenever the event changes after that.
      combine([emptyAnswerSelection$, resetAnswerBeingEditedAction$]).pipe(
        map(
          ([emptyAnswer]) =>
            (_: Answer) =>
              emptyAnswer,
        ),
      ),
    ],
  );

  const setAnswerBeingEdited = (answer: Answer): void => {
    updateAnswerBeingEdited(() => answer);
  };

  const setAnswerBeingEditedSectionState = (
    nextState: 'creating' | 'editing' | 'hidden',
  ): void => {
    setAnswerBeingEditedSectionState_(nextState);

    // 回答追加開始時にデフォルトで「回答を保護する」を有効にする
    if (nextState !== 'creating') {
      return;
    }

    const user = deps.auth.getFireAuthUserSnapshot();

    updateAnswerBeingEdited((ans) => ({
      ...ans,
      user: { ...ans.user, id: mapNullable(user?.uid, UserId.cast) ?? null },
    }));
  };

  const [
    useCheckboxesState,
    setCheckboxesState,
    {
      getSnapshot: getCheckboxesStateSnapshot,
      updateState: updateCheckboxesState,
      resetState: resetCheckboxesState,
    },
  ] = createState(
    ISetMapped.create<DatetimeRange, DatetimeRangeMapKey>(
      [],
      datetimeRangeToMapKey,
      datetimeRangeFromMapKey,
    ),
  );

  const [useBatchInputFieldIsOpen, { toggle: toggleBatchInputField_ }] =
    createBooleanState(false);

  const toggleBatchInputField = (): void => {
    toggleBatchInputField_();

    resetCheckboxesState();
  };

  /* mapped values */

  const selectedAnswerUserName$ = selectedAnswerSavedState$.pipe(
    map((selectedAnswerSaved) => selectedAnswerSaved?.user.name),
  );

  const requiredParticipantsExist$: InitializedObservable<boolean> =
    deps.answers.answers$.pipe(
      map((answers) => answers?.some((a) => a.isRequiredParticipants) === true),
    );

  const selectedDates$: InitializedObservable<readonly YearMonthDate[]> =
    deps.eventSchedule$.pipe(
      map(
        (eventSchedule) =>
          eventSchedule?.datetimeRangeList.map((d) => d.ymd) ?? [],
      ),
    );

  const setYearMonth$: SynstateObservable<CalendarCurrentPageReducerState> =
    selectedDates$
      .pipe(
        map((selectedDates) =>
          Arr.isNonEmpty(selectedDates) ? selectedDates[0] : undefined,
        ),
      )
      .pipe(filter(isNotUndefined));

  const theNameIsAlreadyUsed$: InitializedObservable<boolean> = combine([
    deps.answers.answers$,
    answerBeingEdited$,
    selectedAnswerUserName$,
  ]).pipe(
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
  ]).pipe(
    map(
      ([answerBeingEdited, selectedAnswerSaved, theNameIsAlreadyUsed]) =>
        answerBeingEdited.user.name === '' ||
        fastDeepEqual(selectedAnswerSaved, answerBeingEdited) ||
        theNameIsAlreadyUsed,
    ),
  );

  const answerSelectionMap$: InitializedObservable<
    IMapMapped<DatetimeRange, AnswerSelectionValue, DatetimeRangeMapKey>
  > = combine([
    answerBeingEdited$,
    deps.eventSchedule$
      .pipe(filter(isNotUndefined))
      .pipe(pluck('datetimeRangeList'))
      .pipe(withInitialValue<readonly DatetimeRange[]>([])),
  ]).pipe(
    map(([{ selection }, datetimeRangeList]) => {
      const entries: DeepReadonly<[DatetimeRange, AnswerSelectionValue][]> =
        Arr.concat(
          datetimeRangeList.map((d) => [
            d,
            { iconId: 'none', point: 0, comment: '' } as const,
          ]),
          selection.map((s) => [s.datetimeRange, s]),
        );

      return IMapMapped.create<
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
    updateAnswerBeingEdited((answerBeingEdited) => ({
      ...answerBeingEdited,
      comment,
    }));
  };

  const onWeightChange = (weight: Weight): void => {
    updateAnswerBeingEdited((answerBeingEdited) => ({
      ...answerBeingEdited,
      weight,
    }));
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
    user: SignedInUser | undefined,
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
  const onAddAnswerButtonClickImpl = (user: SignedInUser | undefined): void => {
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
    if (eventId === undefined) {
      return;
    }

    setSubmitButtonIsLoading(true);

    switch (answerBeingEditedSection) {
      case 'creating':
        await deps.api.answers
          .add(eventId, { ...answerBeingEdited, createdAt: DateUtils.now() })
          .then((res) => {
            if (Result.isErr(res)) {
              // TODO: use toast
              console.error(res.value);
            }

            setSubmitButtonIsLoading(false);

            setAnswerBeingEditedSectionState('hidden');

            deps.answers.refetchAnswersAfterWrite();

            clearAnswerBeingEditedFields();

            showToast({
              toast: deps.toast,
              message:
                dict.answerPage.answerBeingEdited.submitButton
                  .createAnswerResultMessage,
              intent: 'success',
            });
          });

        break;

      case 'editing':
        await deps.api.answers
          .update(eventId, answerBeingEdited.id, answerBeingEdited)
          .then((res) => {
            if (Result.isErr(res)) {
              // TODO: use toast
              console.error(res.value);
            }

            setSubmitButtonIsLoading(false);

            setAnswerBeingEditedSectionState('hidden');

            deps.answers.refetchAnswersAfterWrite();

            clearAnswerBeingEditedFields();

            showToast({
              toast: deps.toast,
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
    fireAuthUser: SignedInUser | undefined,
  ): Promise<void> => {
    if (eventId === undefined) {
      return;
    }

    if (fireAuthUser === undefined) {
      return;
    }

    setSubmitButtonIsLoading(true);

    await deps.api.answers
      .add(
        eventId,
        pipe(Answer.defaultValue)
          .map((a) => ({ ...a, createdAt: DateUtils.now() }))
          .map((a) => ({
            ...a,
            user: {
              id: UserId.cast(fireAuthUser.uid),
              name: UserName.cast(fireAuthUser.displayName ?? ''),
            },
          })).value,
      )
      .then((res) => {
        if (Result.isErr(res)) {
          // TODO: use toast
          console.error(res.value);
        }

        setSubmitButtonIsLoading(false);

        setAnswerBeingEditedSectionState('hidden');

        deps.answers.refetchAnswersAfterWrite();

        clearAnswerBeingEditedFields();

        showToast({
          toast: deps.toast,
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
    if (eventId === undefined) {
      return;
    }

    setSubmitButtonIsLoading(true);

    await deps.api.answers.delete(eventId, answerBeingEdited.id).then((res) => {
      if (Result.isErr(res)) {
        // TODO: use toast
        console.error(res.value);
      }

      setSubmitButtonIsLoading(false);

      setAnswerBeingEditedSectionState('hidden');

      deps.answers.refetchAnswersAfterWrite();

      clearAnswerBeingEditedFields();
    });
  };

  /* @internal */
  const onEditButtonClickImpl = (eventId: string | undefined): void => {
    if (eventId !== undefined) {
      deps.router.push(Routes.routes.editPage(eventId));
    }
  };

  /* @internal */
  const answerBeingEditedDispatch = (
    action: AnswerSelectionReducerAction,
  ): void => {
    updateAnswerBeingEdited((answerBeingEdited) => ({
      ...answerBeingEdited,
      selection: answerSelectionReducer(
        IMapMapped.create<
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
    }));
  };

  const toggleProtectedSectionImpl = (user: SignedInUser | undefined): void => {
    updateAnswerBeingEdited((ans) => ({
      ...ans,
      user: Obj.update(ans.user, 'id', (uid) =>
        uid === null ? (mapNullable(user?.uid, UserId.cast) ?? null) : null,
      ),
    }));
  };

  /* callbacks using subscribed values */

  const onAnswerClick = (answer: Answer): void => {
    onAnswerClickImpl(answer, deps.auth.getFireAuthUserSnapshot());
  };

  const onAddAnswerButtonClick = (): void => {
    onAddAnswerButtonClickImpl(deps.auth.getFireAuthUserSnapshot());
  };

  const onEditButtonClick = (): void => {
    onEditButtonClickImpl(deps.router.eventId$.getSnapshot().value);
  };

  const onSubmitAnswerClickPromise = (): Promise<void> =>
    onSubmitAnswerImpl(
      deps.router.eventId$.getSnapshot().value,
      getAnswerBeingEditedSnapshot(),
      getAnswerBeingEditedSectionStateSnapshot(),
    );

  const onSubmitAnswerClick = (): void => {
    onSubmitAnswerImpl(
      deps.router.eventId$.getSnapshot().value,
      getAnswerBeingEditedSnapshot(),
      getAnswerBeingEditedSectionStateSnapshot(),
    ).catch(() => {});
  };

  const onSubmitEmptyAnswerClick = (): Promise<void> =>
    onSubmitEmptyAnswerImpl(
      deps.router.eventId$.getSnapshot().value,
      deps.auth.getFireAuthUserSnapshot(),
    );

  const onDeleteAnswerClick = (): Promise<void> =>
    onDeleteAnswerImpl(
      deps.router.eventId$.getSnapshot().value,
      getAnswerBeingEditedSnapshot(),
    );

  const toggleProtectedSection = (): void => {
    toggleProtectedSectionImpl(deps.auth.getFireAuthUserSnapshot());
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
        ReadonlyRecord<
          AnswerIconId,
          { iconDescription: string; onClick: () => void }
        >
      >
    | undefined
  > = deps.eventSchedule$.pipe(
    map(
      mapNullable((eventSchedule) => ({
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
        buttons: ReadonlyRecord<
          AnswerIconId,
          { description: string; onClick: () => void }
        >;
        onPointChange: (point: AnswerIconPoint) => void;
        onCommentChange: (comment: string) => void;
        onCheck: (checked: boolean) => void;
      }[]
    >
  > = combine([deps.eventSchedule$, answerSelectionMap$]).pipe(
    map(
      ([e, answerSelectionMap]) =>
        mapNullable(e, (eventSchedule) =>
          eventSchedule.datetimeRangeList.map(
            (d) =>
              ({
                key: datetimeRange2str(d),
                datetimeRange: d,
                answerSelectionValue: Optional.toNullable(
                  answerSelectionMap.get(d),
                ) ?? {
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
    const dates =
      deps.eventSchedule$.getSnapshot().value?.datetimeRangeList ?? [];

    if (checked) {
      setCheckboxesState(
        ISetMapped.create<DatetimeRange, DatetimeRangeMapKey>(
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
    answerBeingEditedList$.pipe(
      map((answerBeingEditedList) =>
        answerBeingEditedList.some(
          (a) => a.answerSelectionValue.iconId === 'none',
        ),
      ),
    );

  return {
    answerBeingEdited$,
    answerBeingEditedSectionState$,
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
};

export type AnswerPage = Readonly<{
  /** The answer as it is being written. */
  answerBeingEdited$: InitializedObservable<Answer>;
  answerBeingEditedSectionState$: InitializedObservable<
    'creating' | 'editing' | 'hidden'
  >;
  useAlertOnAnswerClickIsOpen: () => boolean;
  useAnswerBeingEdited: () => Answer;
  answerBeingEditedList$: InitializedObservable<
    DeepReadonly<
      {
        key: string;
        datetimeRange: DatetimeRange;
        answerSelectionValue: AnswerSelectionValue;
        buttons: ReadonlyRecord<
          AnswerIconId,
          { description: string; onClick: () => void }
        >;
        onPointChange: (point: AnswerIconPoint) => void;
        onCommentChange: (comment: string) => void;
        onCheck: (checked: boolean) => void;
      }[]
    >
  >;
  useAnswerBeingEditedSectionState: () => 'creating' | 'editing' | 'hidden';
  hasUnanswered$: InitializedObservable<boolean>;
  iconHeader$: InitializedObservable<
    | DeepReadonly<
        ReadonlyRecord<
          AnswerIconId,
          { iconDescription: string; onClick: () => void }
        >
      >
    | undefined
  >;
  requiredParticipantsExist$: InitializedObservable<boolean>;
  selectedAnswerUserName$: InitializedObservable<UserName | undefined>;
  selectedDates$: InitializedObservable<readonly YearMonthDate[]>;
  setYearMonth$: SynstateObservable<CalendarCurrentPageReducerState>;
  submitButtonIsDisabled$: InitializedObservable<boolean>;
  useSubmitButtonIsLoading: () => boolean;
  theNameIsAlreadyUsed$: InitializedObservable<boolean>;
  useCheckboxesState: () => ISetMapped<DatetimeRange, DatetimeRangeMapKey>;
  useBatchInputFieldIsOpen: () => boolean;
  closeAlertOnAnswerClick: () => void;
  onAddAnswerButtonClick: () => void;
  onAnswerClick: (answer: Answer) => void;
  onCancelEditingAnswer: () => void;
  onCommentChange: (comment: string) => void;
  onDeleteAnswerClick: () => Promise<void>;
  onEditButtonClick: () => void;
  onSubmitAnswerClick: () => void;
  onSubmitAnswerClickPromise: () => Promise<void>;
  onSubmitEmptyAnswerClick: () => Promise<void>;
  onUserNameChange: (userName: UserName) => void;
  onWeightChange: (weight: Weight) => void;
  toggleProtectedSection: () => void;
  toggleRequiredSection: () => void;
  applyBatchInput: (
    input: Readonly<{
      comment: string;
      selectedIconId: AnswerIconIdWithNone;
      point: AnswerIconPoint;
    }>,
  ) => void;
  toggleBatchInputField: () => void;
  onCheckAll: (checked: boolean) => void;
}>;

/** What the page reads of the signed-in user. */
export type SignedInUser = Readonly<{
  uid: string;
  displayName: string | null;
}>;
