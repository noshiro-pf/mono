import type {
  Answer,
  EventSchedule,
  UserName,
} from '@noshiro/event-schedule-app-shared';
import { compareYmdhm } from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import { useNavigator } from '@noshiro/react-router-utils';
import { useStreamValue } from '@noshiro/react-syncflow-hooks';
import { useAlive } from '@noshiro/react-utils';
import type { DeepReadonly } from '@noshiro/ts-utils';
import { IMapMapped, IRecord } from '@noshiro/ts-utils';
import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../../api';
import { texts } from '../../../constants';
import {
  createToaster,
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
  now,
  showToast,
} from '../../../functions';
import { routePaths, useEventId } from '../../../routing';
import { useFetchEventStreams } from './use-fetch-event-stream';
import { useFetchResults } from './use-fetch-results';
import { useAnswerForEditingState } from './use-my-answer';
import { useRefreshButtonState } from './use-refresh-button-state';

type AnswerPageState = DeepReadonly<{
  eventId: string | undefined;
  eventSchedule: EventSchedule | undefined;
  onEditButtonClick: () => void;
  answers: readonly Answer[] | undefined;
  errorType:
    | { data: 'answersResult'; type: 'not-found' | 'others' }
    | { data: 'eventScheduleResult'; type: 'not-found' | 'others' }
    | undefined;
  onAnswerClick: (answer: Answer) => void;
  onAddAnswerButtonClick: () => void;
  myAnswerSectionState: 'creating' | 'editing' | 'hidden';
  answerSectionRef: RefObject<HTMLDivElement>;
  answerForEditing: Answer;
  updateAnswerForEditing: (updater: (answer: Answer) => Answer) => void;
  onCancel: () => void;
  onDeleteAnswer: () => Promise<void>;
  onSubmitAnswer: () => Promise<void>;
  submitButtonIsLoading: boolean;
  submitButtonIsDisabled: boolean;
  fetchAnswers: () => void;
  refreshButtonIsLoading: boolean;
  refreshButtonIsDisabled: boolean;
  isExpired: boolean;
  selectedAnswerUserName: UserName | undefined;
}>;

const toast = createToaster();

export const useAnswerPageState = (): AnswerPageState => {
  const eventId = useEventId();

  const { fetchEventScheduleThrottled$, fetchAnswersThrottled$, fetchAnswers } =
    useFetchEventStreams();

  const { eventSchedule$, answers$, answersResultTimestamp$, errorType } =
    useFetchResults(
      fetchEventScheduleThrottled$,
      fetchAnswersThrottled$,
      eventId
    );

  const [
    //
    myAnswerSectionState,
    setMyAnswerSectionState,
  ] = useState<'creating' | 'editing' | 'hidden'>('hidden');

  const answerSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    switch (myAnswerSectionState) {
      case 'creating':
      case 'editing':
        answerSectionRef.current?.scrollIntoView();
        break;
      case 'hidden':
        break;
    }
  }, [myAnswerSectionState]);

  const [
    //
    submitButtonIsLoading,
    setSubmitButtonIsLoading,
  ] = useState<boolean>(false);

  const { answerForEditing, updateAnswerForEditing, resetAnswerForEditing } =
    useAnswerForEditingState(eventSchedule$);

  const [
    //
    selectedAnswer,
    setSelectedAnswer,
  ] = useState<Answer | undefined>(undefined);

  const onAnswerClick = useCallback(
    (answer: Answer) => {
      setMyAnswerSectionState('editing');
      updateAnswerForEditing(() => answer);
      setSelectedAnswer(answer);
    },
    [updateAnswerForEditing]
  );

  const clearMyAnswerFields = useCallback(() => {
    resetAnswerForEditing();
    setSelectedAnswer(undefined);
  }, [resetAnswerForEditing]);

  const onAddAnswerButtonClick = useCallback(() => {
    clearMyAnswerFields();
    setMyAnswerSectionState('creating');
  }, [clearMyAnswerFields]);

  const eventSchedule = useStreamValue(eventSchedule$);
  const answers = useStreamValue(answers$);

  const submitButtonIsDisabled = useMemo<boolean>(() => {
    if (eventSchedule === undefined) return true;

    const myAnswerAsMap = IMapMapped.new(
      answerForEditing.selection.map(({ datetimeRange, iconId }) => [
        datetimeRange,
        iconId,
      ]),
      datetimeRangeToMapKey,
      datetimeRangeFromMapKey
    );

    const hasEmptyElement =
      answerForEditing.userName === '' ||
      eventSchedule.datetimeRangeList.some(
        (d) => myAnswerAsMap.get(d) === undefined
      );

    const noDiff = deepEqual(selectedAnswer, answerForEditing);

    return hasEmptyElement || noDiff;
  }, [answerForEditing, selectedAnswer, eventSchedule]);

  const onCancel = useCallback(() => {
    clearMyAnswerFields();
    setMyAnswerSectionState('hidden');
  }, [clearMyAnswerFields]);

  const alive = useAlive();
  const onSubmitAnswer = useCallback(async () => {
    if (eventId === undefined) return;
    if (!alive) return;
    setSubmitButtonIsLoading(true);
    switch (myAnswerSectionState) {
      case 'creating':
        await api.answers
          .add(eventId, IRecord.set(answerForEditing, 'createdAt', Date.now()))
          .then(() => {
            if (!alive) return;
            setSubmitButtonIsLoading(false);
            setMyAnswerSectionState('hidden');
            fetchAnswers();
            clearMyAnswerFields();
            showToast({
              toast,
              message:
                texts.answerPage.myAnswer.submitButton
                  .createAnswerResultMessage,
              intent: 'success',
            });
          })
          .catch(console.error);
        break;
      case 'editing':
        await api.answers
          .update(eventId, answerForEditing.id, answerForEditing)
          .then(() => {
            if (!alive) return;
            setSubmitButtonIsLoading(false);
            setMyAnswerSectionState('hidden');
            fetchAnswers();
            clearMyAnswerFields();
            showToast({
              toast,
              message:
                texts.answerPage.myAnswer.submitButton
                  .updateAnswerResultMessage,
              intent: 'success',
            });
          })
          .catch(console.error);
        break;
      case 'hidden':
        break;
    }
  }, [
    answerForEditing,
    myAnswerSectionState,
    eventId,
    alive,
    fetchAnswers,
    clearMyAnswerFields,
  ]);

  const onDeleteAnswer = useCallback(async (): Promise<void> => {
    if (eventId === undefined) return;
    if (!alive) return;
    setSubmitButtonIsLoading(true);
    await api.answers
      .delete(eventId, answerForEditing.id)
      .then(() => {
        if (!alive) return;
        setSubmitButtonIsLoading(false);
        setMyAnswerSectionState('hidden');
        fetchAnswers();
        clearMyAnswerFields();
      })
      .catch(console.error);
  }, [answerForEditing.id, eventId, alive, fetchAnswers, clearMyAnswerFields]);

  const { refreshButtonIsLoading, refreshButtonIsDisabled } =
    useRefreshButtonState(fetchAnswersThrottled$, answersResultTimestamp$);

  const isExpired = useMemo<boolean>(
    () =>
      eventSchedule === undefined
        ? false
        : eventSchedule.useAnswerDeadline &&
          eventSchedule.answerDeadline !== undefined &&
          compareYmdhm(now(), eventSchedule.answerDeadline) >= 0,
    [eventSchedule]
  );

  const routerNavigator = useNavigator();

  const onEditButtonClick = useCallback(() => {
    if (eventId !== undefined) {
      routerNavigator(routePaths.editPage(eventId));
    }
  }, [routerNavigator, eventId]);

  return {
    eventId,
    eventSchedule,
    onEditButtonClick,
    answers,
    errorType,
    onAnswerClick,
    onAddAnswerButtonClick,
    myAnswerSectionState,
    answerSectionRef,
    answerForEditing,
    updateAnswerForEditing,
    onCancel,
    onDeleteAnswer,
    onSubmitAnswer,
    submitButtonIsLoading,
    submitButtonIsDisabled,
    fetchAnswers,
    refreshButtonIsLoading,
    refreshButtonIsDisabled,
    isExpired,
    selectedAnswerUserName: selectedAnswer?.userName,
  };
};
