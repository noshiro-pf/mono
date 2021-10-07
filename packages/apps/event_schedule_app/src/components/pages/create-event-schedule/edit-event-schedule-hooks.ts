import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { useAlive, useBooleanState } from '@noshiro/react-utils';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import { useCallback } from 'react';
import { api } from '../../../api';
import { routes, texts } from '../../../constants';
import { createToaster, showToast } from '../../../functions';
import { router } from '../../../store';

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
  const [isLoading, setIsLoadingTrue, setIsLoadingFalse] =
    useBooleanState(false);

  const eventId = useStreamValue(router.eventId$);

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
      .then(() => {
        if (!alive.current) return;
        setIsLoadingFalse();
        onBackToAnswerPage();
        showToast({
          toast,
          message: texts.eventSettingsPage.editEventResultMessage,
          intent: 'success',
        });
      })
      .catch((error) => {
        console.error('Error creating event schedule: ', error);
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
