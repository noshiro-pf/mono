import { answerDefaultValue } from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import { api } from '../../api';
import { datetimeRange2str, Routes } from '../../constants';
import type {
  AnswerSelectionReducerAction,
  CalendarCurrentPageReducerState,
} from '../../functions';
import {
  answerSelectionReducer,
  createToaster,
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
  showToast,
  theNameIsAlreadyUsedFn,
} from '../../functions';
import type { AnswerSelectionValue } from '../../types';
import { fireAuthUser$ } from '../auth';
import { answers$, AnswersStore, eventSchedule$ } from '../fetching-state';
import { router } from '../router';

const toast = createToaster();

export namespace AnswerPageStore {
  /* states */

  const { state$: selectedAnswerSaved$, setState: setSelectedAnswerSaved } =
    createState<Answer | undefined>(undefined);

  const {
    state$: _submitButtonIsLoading$,
    setState: setSubmitButtonIsLoading,
  } = createState<boolean>(false);
  export const submitButtonIsLoading$ = _submitButtonIsLoading$;

  const {
    state$: _alertOnAnswerClickIsOpen$,
    setTrue: openAlertOnAnswerClick,
    setFalse: _closeAlertOnAnswerClick,
  } = createBooleanState(false);
  export const alertOnAnswerClickIsOpen$ = _alertOnAnswerClickIsOpen$;
  export const closeAlertOnAnswerClick = _closeAlertOnAnswerClick;

  const {
    state$: _answerBeingEditedSectionState$,
    setState: _setAnswerBeingEditedSectionState,
  } = createState<'creating' | 'editing' | 'hidden'>('hidden');
  export const answerBeingEditedSectionState$ = _answerBeingEditedSectionState$;

  const {
    state$: _answerBeingEdited$,
    setState: setAnswerBeingEdited,
    updateState: updateAnswerBeingEdited,
  } = createState(answerDefaultValue);
  export const answerBeingEdited$ = _answerBeingEdited$;

  const setAnswerBeingEditedSectionState = (
    nextState: 'creating' | 'editing' | 'hidden'
  ): void => {
    _setAnswerBeingEditedSectionState(nextState);

    // 回答追加開始時にデフォルトで「回答を保護する」を有効にする
    if (nextState === 'creating') {
      const user = mut_subscribedValues.fireAuthUser;

      updateAnswerBeingEdited((ans) =>
        IRecord.set(ans, 'user', IRecord.set(ans.user, 'id', user?.uid ?? null))
      );
    }
  };

  const [resetAnswerBeingEditedAction$, resetAnswerBeingEdited] =
    createVoidEventEmitter();

  /* mapped values */

  export const selectedAnswerUserName$ = selectedAnswerSaved$.chain(
    mapI((selectedAnswerSaved) => selectedAnswerSaved?.user.name)
  );

  export const requiredParticipantsExist$: InitializedObservable<boolean> =
    answers$.chain(
      mapI((answers) => answers?.some((a) => a.isRequiredParticipants) === true)
    );

  export const selectedDates$: InitializedObservable<readonly YearMonthDate[]> =
    eventSchedule$.chain(
      mapI(
        (eventSchedule) =>
          eventSchedule?.datetimeRangeList.map((d) => d.ymd) ?? []
      )
    );

  export const setYearMonth$: Observable<CalendarCurrentPageReducerState> =
    selectedDates$
      .chain(
        map((selectedDates) =>
          IList.isNonEmpty(selectedDates) ? selectedDates[0] : undefined
        )
      )
      .chain(filter(isNotUndefined));

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

  export const theNameIsAlreadyUsed$: InitializedObservable<boolean> =
    combineLatestI([
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

  export const submitButtonIsDisabled$: InitializedObservable<boolean> =
    combineLatestI([
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

  export const onCancelEditingAnswer = (): void => {
    clearAnswerBeingEditedFields();
    setAnswerBeingEditedSectionState('hidden');
  };

  export const onUserNameChange = (userName: string): void => {
    updateAnswerBeingEdited((answerBeingEdited) =>
      IRecord.setIn(answerBeingEdited, ['user', 'name'], userName)
    );
  };

  export const onCommentChange = (comment: string): void => {
    updateAnswerBeingEdited((answerBeingEdited) =>
      IRecord.set(answerBeingEdited, 'comment', comment)
    );
  };

  export const onWeightChange = (weight: Weight): void => {
    updateAnswerBeingEdited((answerBeingEdited) =>
      IRecord.set(answerBeingEdited, 'weight', weight)
    );
  };

  export const toggleRequiredSection = (): void => {
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
          .add(
            eventId,
            IRecord.set(answerBeingEdited, 'createdAt', IDate.now())
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
    fireAuthUser: FireAuthUser | undefined
  ): Promise<void> => {
    if (eventId === undefined) return;
    if (fireAuthUser === undefined) return;

    setSubmitButtonIsLoading(true);

    await api.answers
      .add(
        eventId,
        pipe(answerDefaultValue)
          .chain((a) => IRecord.set(a, 'createdAt', IDate.now()))
          .chain((a) =>
            IRecord.set(a, 'user', {
              id: fireAuthUser.uid,
              name: fireAuthUser.displayName ?? '',
            })
          ).value
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
    answerBeingEdited: Answer
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
      router.push(Routes.routes.editPage(eventId));
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
    fireAuthUser: FireAuthUser | undefined;
    answerSelectionMap: IMapMapped<
      DatetimeRange,
      AnswerSelectionValue,
      DatetimeRangeMapKey
    >;
  } = {
    eventId: undefined,
    answerBeingEdited: answerDefaultValue,
    answerBeingEditedSectionState: 'hidden',
    fireAuthUser: undefined,
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
    mut_subscribedValues.fireAuthUser = u;
  });

  answerSelectionMap$.subscribe((u) => {
    mut_subscribedValues.answerSelectionMap = u;
  });

  /* callbacks using subscribed values */

  export const onAnswerClick = (answer: Answer): void => {
    onAnswerClickImpl(answer, mut_subscribedValues.fireAuthUser);
  };

  export const onAddAnswerButtonClick = (): void => {
    onAddAnswerButtonClickImpl(mut_subscribedValues.fireAuthUser);
  };

  export const onEditButtonClick = (): void => {
    onEditButtonClickImpl(mut_subscribedValues.eventId);
  };

  export const onSubmitAnswerClickPromise = (): Promise<void> =>
    onSubmitAnswerImpl(
      mut_subscribedValues.eventId,
      mut_subscribedValues.answerBeingEdited,
      mut_subscribedValues.answerBeingEditedSectionState
    );

  export const onSubmitAnswerClick = (): void => {
    onSubmitAnswerImpl(
      mut_subscribedValues.eventId,
      mut_subscribedValues.answerBeingEdited,
      mut_subscribedValues.answerBeingEditedSectionState
    ).catch(noop);
  };

  export const onSubmitEmptyAnswerClick = (): Promise<void> =>
    onSubmitEmptyAnswerImpl(
      mut_subscribedValues.eventId,
      mut_subscribedValues.fireAuthUser
    );

  export const onDeleteAnswerClick = (): Promise<void> =>
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

  export const toggleProtectedSection = (): void => {
    toggleProtectedSectionImpl(mut_subscribedValues.fireAuthUser);
  };

  /* combined values */

  export const iconHeader$: InitializedObservable<
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
      }))
    )
  );

  export const answerBeingEditedList$: InitializedObservable<
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
              } as const)
          )
        ) ?? []
    )
  );

  export const hasUnanswered$: InitializedObservable<boolean> =
    answerBeingEditedList$.chain(
      mapI((answerBeingEditedList) =>
        answerBeingEditedList.some(
          (a) => a.answerSelectionValue.iconId === 'none'
        )
      )
    );
}
