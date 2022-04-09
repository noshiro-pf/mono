import { createEventScheduleSettingStore } from './event-schedule-setting-common';

export namespace CreateEventSchedule {
  export const { commonState$, commonStateHandlers } =
    createEventScheduleSettingStore();

  export const resetAllState = (): void => {
    commonStateHandlers.resetTitle();
    commonStateHandlers.resetNotes();
    commonStateHandlers.resetDatetimeSpecification();
    commonStateHandlers.resetDatetimeRangeList();
    commonStateHandlers.resetAnswerDeadlineSection();
    commonStateHandlers.resetNotificationSettingsSection();
    commonStateHandlers.resetAnswerIcons();
  };
}
