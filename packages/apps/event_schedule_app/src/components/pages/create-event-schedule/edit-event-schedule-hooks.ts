import { useNavigator } from '@noshiro/react-router-utils';
import { useBooleanState } from '@noshiro/react-utils';
import { useCallback } from 'react';
import { api } from '../../../api/api';
import { texts } from '../../../constants/texts';
import { routePaths } from '../../../routing/routing';
import { useEventId } from '../../../routing/use-event-id';
import { IEventSchedule } from '../../../types/record/event-schedule';
import { createToaster, showToast } from '../../../utils/toaster';

interface EditEventScheduleHooks {
  editButtonIsEnabled: boolean;
  editButtonIsLoading: boolean;
  onEditEventClick: () => void;
  onBackToAnswerPageClick: () => void;
  isLoading: boolean;
}

const toast = createToaster();

export const useEditEventScheduleHooks = ({
  newEventSchedule,
  eventScheduleValidationOk,
}: {
  newEventSchedule: IEventSchedule;
  eventScheduleValidationOk: boolean;
}): EditEventScheduleHooks => {
  const [isLoading, setIsLoadingTrue, setIsLoadingFalse] = useBooleanState(
    false
  );

  const eventId = useEventId();

  const navigator = useNavigator();

  const answerPagePath = `${routePaths.answerPage}/${eventId ?? ''}`;

  const onBackToAnswerPage = useCallback(() => {
    navigator(answerPagePath);
  }, [navigator, answerPagePath]);

  const onEditEventClick = useCallback(() => {
    if (!eventScheduleValidationOk) return;
    if (eventId === undefined) return;

    setIsLoadingTrue();
    api.event
      .update(eventId, newEventSchedule)
      .then(() => {
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
  ]);

  return {
    editButtonIsEnabled: eventScheduleValidationOk,
    editButtonIsLoading: isLoading,
    onBackToAnswerPageClick: onBackToAnswerPage,
    onEditEventClick,
    isLoading,
  };
};
