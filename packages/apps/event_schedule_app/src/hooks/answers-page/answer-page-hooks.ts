import type {
  Answer,
  EventSchedule,
  UserName,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import { compareYmdhm } from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import { useAlive } from '@noshiro/react-utils';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import type { IMapMapped } from '@noshiro/ts-utils';
import { IRecord } from '@noshiro/ts-utils';
import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../api';
import { routes, texts } from '../../constants';
import type { YmdKey } from '../../functions';
import { createToaster, now, showToast } from '../../functions';
import {
  answers$,
  errorType$,
  eventSchedule$,
  fetchAnswers,
  fetchEventSchedule,
  holidaysJpDefinition$,
  refreshButtonIsDisabled$,
  refreshButtonIsLoading$,
  requiredParticipantsExist$,
  router,
} from '../../store';
import { useAnswerBeingEditedState } from './answer-being-edited-state-hooks';

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
  answerBeingEditedSectionState: 'creating' | 'editing' | 'hidden';
  answerBeingEdited: Answer;
  updateAnswerBeingEdited: (updater: (answer: Answer) => Answer) => void;
  onCancel: () => void;
  onDeleteAnswer: () => Promise<void>;
  onSubmitAnswer: () => Promise<void>;
  submitButtonIsLoading: boolean;
  submitButtonIsDisabled: boolean;
  refreshButtonIsLoading: boolean;
  refreshButtonIsDisabled: boolean;
  isExpired: boolean;
  selectedAnswerUserName: UserName | undefined;
  requiredParticipantsExist: boolean;
  selectedDates: readonly YearMonthDate[];
  holidaysJpDefinition?: IMapMapped<YearMonthDate, string, YmdKey>;
}> & {
  readonly answerSectionRef: RefObject<HTMLDivElement>;
};

const toast = createToaster();

export const useAnswerPageState = (): AnswerPageState => {
  /* state */

  const [answerBeingEditedSectionState, setAnswerBeingEditedSectionState] =
    useState<'creating' | 'editing' | 'hidden'>('hidden');

  const [
    //
    selectedAnswer,
    setSelectedAnswer,
  ] = useState<Answer | undefined>(undefined);

  const [submitButtonIsLoading, setSubmitButtonIsLoading] =
    useState<boolean>(false);

  const {
    answerBeingEdited,
    setAnswerBeingEdited,
    updateAnswerBeingEdited,
    resetAnswerBeingEdited,
  } = useAnswerBeingEditedState(eventSchedule$);

  /* effect */

  const answerSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    switch (answerBeingEditedSectionState) {
      case 'creating':
      case 'editing':
        answerSectionRef.current?.scrollIntoView();
        break;
      case 'hidden':
        break;
    }
  }, [answerBeingEditedSectionState]);

  // fetch once on the first load
  useEffect(() => {
    fetchEventSchedule();
    fetchAnswers();
  }, []);

  /* callback functions */

  const onAnswerClick = useCallback(
    (answer: Answer) => {
      setAnswerBeingEditedSectionState('editing');
      setAnswerBeingEdited(answer);
      setSelectedAnswer(answer);
    },
    [setAnswerBeingEdited]
  );

  const clearAnswerBeingEditedFields = useCallback(() => {
    resetAnswerBeingEdited();
    setSelectedAnswer(undefined);
  }, [resetAnswerBeingEdited]);

  const onAddAnswerButtonClick = useCallback(() => {
    clearAnswerBeingEditedFields();
    setAnswerBeingEditedSectionState('creating');
  }, [clearAnswerBeingEditedFields]);

  const onCancel = useCallback(() => {
    clearAnswerBeingEditedFields();
    setAnswerBeingEditedSectionState('hidden');
  }, [clearAnswerBeingEditedFields]);

  const eventId = useStreamValue(router.eventId$);
  const eventSchedule = useStreamValue(eventSchedule$);

  const alive = useAlive();

  const onSubmitAnswer = useCallback(async () => {
    if (eventId === undefined) return;
    if (!alive.current) return;
    setSubmitButtonIsLoading(true);
    switch (answerBeingEditedSectionState) {
      case 'creating':
        await api.answers
          .add(eventId, IRecord.set(answerBeingEdited, 'createdAt', Date.now()))
          .then(() => {
            if (!alive.current) return;
            setSubmitButtonIsLoading(false);
            setAnswerBeingEditedSectionState('hidden');
            fetchAnswers();
            clearAnswerBeingEditedFields();
            showToast({
              toast,
              message:
                texts.answerPage.answerBeingEdited.submitButton
                  .createAnswerResultMessage,
              intent: 'success',
            });
          })
          .catch(console.error);
        break;
      case 'editing':
        await api.answers
          .update(eventId, answerBeingEdited.id, answerBeingEdited)
          .then(() => {
            if (!alive.current) return;
            setSubmitButtonIsLoading(false);
            setAnswerBeingEditedSectionState('hidden');
            fetchAnswers();
            clearAnswerBeingEditedFields();
            showToast({
              toast,
              message:
                texts.answerPage.answerBeingEdited.submitButton
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
    answerBeingEdited,
    answerBeingEditedSectionState,
    eventId,
    alive,
    clearAnswerBeingEditedFields,
  ]);

  const onDeleteAnswer = useCallback(async (): Promise<void> => {
    if (eventId === undefined) return;
    if (!alive.current) return;
    setSubmitButtonIsLoading(true);
    await api.answers
      .delete(eventId, answerBeingEdited.id)
      .then(() => {
        if (!alive.current) return;
        setSubmitButtonIsLoading(false);
        setAnswerBeingEditedSectionState('hidden');
        fetchAnswers();
        clearAnswerBeingEditedFields();
      })
      .catch(console.error);
  }, [answerBeingEdited.id, eventId, alive, clearAnswerBeingEditedFields]);

  const isExpired = useMemo<boolean>(
    () =>
      eventSchedule === undefined
        ? false
        : eventSchedule.useAnswerDeadline &&
          eventSchedule.answerDeadline !== undefined &&
          compareYmdhm(now(), eventSchedule.answerDeadline) >= 0,
    [eventSchedule]
  );

  const onEditButtonClick = useCallback(() => {
    if (eventId !== undefined) {
      router.push(routes.editPage(eventId));
    }
  }, [eventId]);

  /* values */

  const submitButtonIsDisabled = useMemo<boolean>(
    () =>
      answerBeingEdited.userName === '' ||
      deepEqual(selectedAnswer, answerBeingEdited),
    [answerBeingEdited, selectedAnswer]
  );

  const errorType = useStreamValue(errorType$);
  const answers = useStreamValue(answers$);
  const requiredParticipantsExist = useStreamValue(requiredParticipantsExist$);
  const refreshButtonIsLoading = useStreamValue(refreshButtonIsLoading$);
  const refreshButtonIsDisabled = useStreamValue(refreshButtonIsDisabled$);

  const selectedDates = useMemo<readonly YearMonthDate[]>(
    () => eventSchedule?.datetimeRangeList.map((d) => d.ymd) ?? [],
    [eventSchedule]
  );

  const holidaysJpDefinition = useStreamValue(holidaysJpDefinition$);

  return {
    eventId,
    eventSchedule,
    onEditButtonClick,
    answers,
    errorType,
    onAnswerClick,
    onAddAnswerButtonClick,
    answerBeingEditedSectionState,
    answerSectionRef,
    answerBeingEdited,
    updateAnswerBeingEdited,
    onCancel,
    onDeleteAnswer,
    onSubmitAnswer,
    submitButtonIsLoading,
    submitButtonIsDisabled,
    refreshButtonIsLoading,
    refreshButtonIsDisabled,
    isExpired,
    selectedAnswerUserName: selectedAnswer?.userName,
    requiredParticipantsExist,
    selectedDates,
    holidaysJpDefinition,
  };
};
