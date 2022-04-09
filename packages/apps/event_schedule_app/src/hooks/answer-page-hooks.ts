import type {
  Answer,
  EventSchedule,
  UserName,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import type { RefObject } from 'react';
import { useRef } from 'react';
import {
  alertOnAnswerClickIsOpen$,
  answerBeingEdited$,
  answerBeingEditedSectionState$,
  answers$,
  errorType$,
  eventSchedule$,
  fetchAnswers,
  fetchEventSchedule,
  isStateAfterDeadline$,
  refreshButtonIsDisabled$,
  refreshButtonIsLoading$,
  requiredParticipantsExist$,
  router,
  selectedAnswerUserName$,
  selectedDates$,
  submitButtonIsDisabled$,
  submitButtonIsLoading$,
} from '../store';

type AnswerPageState = DeepReadonly<{
  alertOnAnswerClickIsOpen: boolean;
  answerBeingEdited: Answer;
  answerBeingEditedSectionState: 'creating' | 'editing' | 'hidden';
  answers: Answer[] | undefined;
  errorType:
    | {
        data: 'eventScheduleResult';
        type: { type: 'not-found' | 'others'; message: string };
      }
    | { data: 'answersResult'; type: { type: 'others'; message: string } }
    | undefined;
  eventId: string | undefined;
  eventSchedule: EventSchedule | undefined;
  isStateAfterDeadline: boolean;
  refreshButtonIsDisabled: boolean;
  refreshButtonIsLoading: boolean;
  requiredParticipantsExist: boolean;
  selectedAnswerUserName: UserName | undefined;
  selectedDates: YearMonthDate[];
  submitButtonIsDisabled: boolean;
  submitButtonIsLoading: boolean;
}> & {
  readonly answerSectionRef: RefObject<HTMLDivElement>;
};

export const useAnswerPageState = (): AnswerPageState => {
  /* values */

  const alertOnAnswerClickIsOpen = useObservableValue(
    alertOnAnswerClickIsOpen$
  );
  const answerBeingEdited = useObservableValue(answerBeingEdited$);
  const answerBeingEditedSectionState = useObservableValue(
    answerBeingEditedSectionState$
  );
  const answers = useObservableValue(answers$);
  const errorType = useObservableValue(errorType$);
  const eventId = useObservableValue(router.eventId$);
  const eventSchedule = useObservableValue(eventSchedule$);
  const isStateAfterDeadline = useObservableValue(isStateAfterDeadline$);
  const refreshButtonIsDisabled = useObservableValue(refreshButtonIsDisabled$);
  const refreshButtonIsLoading = useObservableValue(refreshButtonIsLoading$);
  const requiredParticipantsExist = useObservableValue(
    requiredParticipantsExist$
  );
  const selectedAnswerUserName = useObservableValue(selectedAnswerUserName$);
  const selectedDates = useObservableValue(selectedDates$);
  const submitButtonIsDisabled = useObservableValue(submitButtonIsDisabled$);
  const submitButtonIsLoading = useObservableValue(submitButtonIsLoading$);

  /* effect */

  // fetch once on the first load
  useEffect(() => {
    fetchEventSchedule();
    fetchAnswers();
  }, []);

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

  return {
    alertOnAnswerClickIsOpen,
    answerBeingEdited,
    answerBeingEditedSectionState,
    answers,
    answerSectionRef,
    errorType,
    eventId,
    eventSchedule,
    isStateAfterDeadline,
    refreshButtonIsDisabled,
    refreshButtonIsLoading,
    requiredParticipantsExist,
    selectedAnswerUserName,
    selectedDates,
    submitButtonIsDisabled,
    submitButtonIsLoading,
  };
};
