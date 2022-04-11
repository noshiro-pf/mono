import { eventScheduleDefaultValue } from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import {
  initialAnswerDeadline,
  initialEventSchedule,
  initialNotificationSettings,
} from '../../constants';
import {
  normalizeEventSchedule,
  validateEventSchedule,
  validateEventScheduleAll,
} from '../../functions';
import type {
  EventScheduleSettingCommonState,
  EventScheduleSettingCommonStateHandler,
  EventScheduleValidation,
} from '../../types';
import { mapNoneToUndefined } from '../../utils';
import { user$ } from '../auth';
import { createToggleSectionState } from '../utils';

type ReturnValues = Readonly<{
  commonState$: InitializedObservable<EventScheduleSettingCommonState>;
  commonStateHandlers: EventScheduleSettingCommonStateHandler;
}>;

export const createEventScheduleSettingStore = (): ReturnValues => {
  const {
    state$: title$,
    setState: setTitle,
    resetState: resetTitle,
  } = createState<string>(initialEventSchedule.title);

  const {
    state$: notes$,
    setState: setNotes,
    resetState: resetNotes,
  } = createState<string>(initialEventSchedule.notes);

  const {
    state$: datetimeSpecification$,
    setState: setDatetimeSpecification,
    resetState: resetDatetimeSpecification,
  } = createState<DatetimeSpecificationEnumType>(
    initialEventSchedule.datetimeSpecification
  );

  const {
    state$: datetimeRangeList$,
    setState: setDatetimeRangeList,
    resetState: resetDatetimeRangeList,
  } = createState<readonly DatetimeRange[]>(
    initialEventSchedule.datetimeRangeList
  );

  const {
    toggleState$: useAnswerDeadline$,
    toggle: toggleAnswerDeadlineSection,
    value$: answerDeadline$,
    setValue: setAnswerDeadline,
    resetState: resetAnswerDeadlineSection,
  } = createToggleSectionState<Ymdhm | undefined>({
    initialToggleState: initialEventSchedule.answerDeadline !== 'none',
    initialState: mapNoneToUndefined(initialEventSchedule.answerDeadline),
    valueToBeSetWhenTurnedOff: () => undefined,
    valueToBeSetWhenTurnedOn: () => initialAnswerDeadline,
  });

  const {
    state$: answerIcons$,
    setState: setAnswerIcons,
    resetState: resetAnswerIcons,
  } = createState<AnswerIconSettings>(initialEventSchedule.answerIcons);

  const initialNotificationSettingsWithEmailFilled$ = user$.chain(
    mapI((user) => ({
      ...initialNotificationSettings,
      email: user?.email ?? '',
    }))
  );

  const {
    toggleState$: useNotification$,
    toggle: toggleNotificationSection,
    value$: notificationSettings$,
    setValue: setNotificationSettings,
    resetState: resetNotificationSettingsSection,
  } = createToggleSectionState<NotificationSettings | undefined>({
    initialToggleState: initialEventSchedule.notificationSettings !== 'none',
    initialState: mapNoneToUndefined(initialEventSchedule.notificationSettings),
    valueToBeSetWhenTurnedOff: () => undefined,
    valueToBeSetWhenTurnedOn: () =>
      initialNotificationSettingsWithEmailFilled$.currentValue.value,
  });

  const newEventSchedule$: InitializedObservable<EventSchedule> =
    combineLatestI([
      title$,
      notes$,
      datetimeSpecification$,
      datetimeRangeList$,
      answerDeadline$,
      answerIcons$,
      notificationSettings$,
      user$,
    ]).chain(
      mapI(
        ([
          title,
          notes,
          datetimeSpecification,
          datetimeRangeList,
          answerDeadline,
          answerIcons,
          notificationSettings,
          user,
        ]) =>
          normalizeEventSchedule({
            title,
            notes,
            datetimeSpecification,
            datetimeRangeList,
            answerDeadline: answerDeadline ?? 'none',
            answerIcons,
            notificationSettings: notificationSettings ?? 'none',
            timezoneOffsetMinutes:
              eventScheduleDefaultValue.timezoneOffsetMinutes,
            author: {
              id: user?.uid ?? null,
              name: user?.displayName ?? '',
            },
          })
      )
    );

  const eventScheduleValidation$: InitializedObservable<EventScheduleValidation> =
    combineLatestI([
      title$,
      datetimeRangeList$,
      answerIcons$,
      notificationSettings$,
    ]).chain(
      mapI(([title, datetimeRangeList, answerIcons, notificationSettings]) =>
        validateEventSchedule({
          title,
          datetimeRangeList,
          answerIcons,
          notificationSettings: notificationSettings ?? 'none',
        })
      )
    );

  const eventScheduleValidationOk$ = eventScheduleValidation$.chain(
    mapI(validateEventScheduleAll)
  );

  const hasNoChanges$: InitializedObservable<boolean> = newEventSchedule$.chain(
    mapI((newEventSchedule) =>
      deepEqual(initialEventSchedule, newEventSchedule)
    )
  );

  const commonState$: InitializedObservable<EventScheduleSettingCommonState> =
    combineLatestI([
      title$,
      notes$,
      datetimeSpecification$,
      datetimeRangeList$,
      useAnswerDeadline$,
      answerDeadline$,
      answerIcons$,
      useNotification$,
      notificationSettings$,
      eventScheduleValidation$,
      hasNoChanges$,
      newEventSchedule$,
      eventScheduleValidationOk$,
    ]).chain(
      mapI(
        ([
          title,
          notes,
          datetimeSpecification,
          datetimeRangeList,
          useAnswerDeadline,
          answerDeadline,
          answerIcons,
          useNotification,
          notificationSettings,
          eventScheduleValidation,
          hasNoChanges,
          newEventSchedule,
          eventScheduleValidationOk,
        ]) => ({
          title,
          notes,
          datetimeSpecification,
          datetimeRangeList,
          useAnswerDeadline,
          answerDeadline,
          answerIcons,
          useNotification,
          notificationSettings,
          eventScheduleValidation,
          hasNoChanges,
          newEventSchedule,
          eventScheduleValidationOk,
        })
      )
    );

  const commonStateHandlers: EventScheduleSettingCommonStateHandler = {
    setTitle,
    resetTitle,

    setNotes,
    resetNotes,

    setDatetimeSpecification,
    resetDatetimeSpecification,

    setDatetimeRangeList,
    resetDatetimeRangeList,

    toggleAnswerDeadlineSection,
    setAnswerDeadline,
    resetAnswerDeadlineSection,

    setAnswerIcons,
    resetAnswerIcons,

    toggleNotificationSection,
    setNotificationSettings,
    resetNotificationSettingsSection,
  };

  return {
    commonState$,
    commonStateHandlers,
  };
};
