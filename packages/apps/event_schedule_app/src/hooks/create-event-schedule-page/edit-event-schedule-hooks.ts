import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { useAlive, useBoolState } from '@noshiro/react-utils';
import { useObservableValue } from '@noshiro/syncflow-react-hooks';
import { Result } from '@noshiro/ts-utils';
import { useCallback } from 'react';
import { api } from '../../api';
import { dict, routes } from '../../constants';
import { createToaster, showToast } from '../../functions';
import { fetchAnswers, fetchEventSchedule, router } from '../../store';

type EditEventScheduleHooks = Readonly<{
  editButtonIsEnabled: boolean;
  editButtonIsLoading: boolean;
  onEditEventClick: () => void;
  onBackToAnswerPageClick: () => void;
}>;

const toast = createToaster();

export const useEditEventScheduleHooks = ({
  newEventSchedule,
  eventScheduleValidationOk,
}: Readonly<{
  newEventSchedule: EventSchedule;
  eventScheduleValidationOk: boolean;
}>): EditEventScheduleHooks => {
  const {
    state: isLoading,
    setTrue: setIsLoadingTrue,
    setFalse: setIsLoadingFalse,
  } = useBoolState(false);

  const eventId = useObservableValue(router.eventId$);

  const answerPagePath = routes.answerPage(eventId ?? '');

  const onBackToAnswerPage = useCallback(() => {
    router.push(answerPagePath);
  }, [answerPagePath]);

  const alive = useAlive();
  const onEditEventClick = useCallback(() => {
    if (!eventScheduleValidationOk) return;
    if (eventId === undefined) return;
    if (!alive.current) return;

    setIsLoadingTrue();
    api.event
      .update(eventId, newEventSchedule)
      .then((res) => {
        if (!alive.current) return;

        if (Result.isErr(res)) {
          console.error(res.value);
        }

        setIsLoadingFalse();
        fetchAnswers();
        fetchEventSchedule();
        onBackToAnswerPage();
        showToast({
          toast,
          message: dict.eventSettingsPage.editEventResultMessage.success,
          intent: 'success',
        });
      })
      .catch((error) => {
        console.error('Error creating event schedule: ', error);
        showToast({
          toast,
          message: dict.eventSettingsPage.editEventResultMessage.error,
          intent: 'danger',
        });
      });
  }, [
    eventScheduleValidationOk,
    newEventSchedule,
    setIsLoadingTrue,
    setIsLoadingFalse,
    eventId,
    onBackToAnswerPage,
    alive,
  ]);

  return {
    editButtonIsEnabled: eventScheduleValidationOk,
    editButtonIsLoading: isLoading,
    onBackToAnswerPageClick: onBackToAnswerPage,
    onEditEventClick,
  };
};
