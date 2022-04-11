import { api } from '../../api';
import { routes } from '../../constants';
import type { EventSettingsPageDiffResult } from '../../functions';
import {
  collectEventSettingsPageDiff,
  createToaster,
  showToast,
} from '../../functions';
import { fetchAnswers, fetchEventSchedule, router } from '../../store';
import type {
  EventScheduleSettingCommonState,
  EventScheduleSettingCommonStateHandler,
} from '../../types';
import { useEventScheduleSettingCommonHooks } from './event-schedule-setting-common-hooks';

type EditEventScheduleHooks = Readonly<{
  commonState: EventScheduleSettingCommonState;
  commonStateHandlers: EventScheduleSettingCommonStateHandler;
  resetAllState: () => void;
  editButtonIsEnabled: boolean;
  editButtonIsLoading: boolean;
  diff: EventSettingsPageDiffResult;
  hasDeletedDatetimeChanges: boolean;
  onEditEventClick: () => void;
  onBackToAnswerPageClick: () => void;
}>;

const toast = createToaster();

export const useEditEventScheduleHooks = (
  eventSchedule: EventSchedule
): EditEventScheduleHooks => {
  const { state: commonState, handlers: commonStateHandlers } =
    useEventScheduleSettingCommonHooks(eventSchedule);

  const resetAllState = useCallback(() => {
    commonStateHandlers.resetTitle();
    commonStateHandlers.resetNotes();
    commonStateHandlers.resetDatetimeSpecification();
    commonStateHandlers.resetDatetimeRangeList();
    commonStateHandlers.resetAnswerDeadlineSection();
    commonStateHandlers.resetNotificationSettingsSection();
    commonStateHandlers.resetAnswerIcons();
  }, [commonStateHandlers]);

  const { newEventSchedule, eventScheduleValidationOk } = commonState;

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

  const editEvent = useCallback(async () => {
    if (!eventScheduleValidationOk || eventId === undefined || !alive.current)
      return;

    setIsLoadingTrue();
    const res = await api.event.update(eventId, newEventSchedule);

    if (Result.isErr(res)) {
      console.error('Error creating event schedule: ', res.value);
      showToast({
        toast,
        message: dict.eventSettingsPage.editEventResultMessage.error,
        intent: 'danger',
      });
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
  }, [
    eventScheduleValidationOk,
    newEventSchedule,
    setIsLoadingTrue,
    setIsLoadingFalse,
    eventId,
    onBackToAnswerPage,
    alive,
  ]);

  const onEditEventClick = useCallback(() => {
    editEvent().catch(console.error);
  }, [editEvent]);

  const diff = useMemo<EventSettingsPageDiffResult>(
    () => collectEventSettingsPageDiff(eventSchedule, newEventSchedule),
    [eventSchedule, newEventSchedule]
  );

  const hasDeletedDatetimeChanges = useMemo<boolean>(
    () =>
      diff.datetimeRangeList?.deleted !== undefined &&
      IList.isNonEmpty(diff.datetimeRangeList.deleted),
    [diff.datetimeRangeList]
  );

  return {
    commonState,
    commonStateHandlers,
    resetAllState,
    editButtonIsEnabled: eventScheduleValidationOk,
    editButtonIsLoading: isLoading,
    diff,
    hasDeletedDatetimeChanges,
    onBackToAnswerPageClick: onBackToAnswerPage,
    onEditEventClick,
  };
};
