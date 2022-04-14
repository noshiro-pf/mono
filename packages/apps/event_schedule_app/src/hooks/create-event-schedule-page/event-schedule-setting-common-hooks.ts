import { eventScheduleDefaultValue } from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import { useRef } from 'react';
import {
  initialAnswerDeadline,
  initialNotificationSettings,
} from '../../constants';
import {
  normalizeEventSchedule,
  validateEventSchedule,
  validateEventScheduleAll,
} from '../../functions';
import { useUser } from '../../store';
import type {
  EventScheduleSettingCommonState,
  EventScheduleSettingCommonStateHandler,
  EventScheduleValidation,
} from '../../types';
import { mapNoneToUndefined } from '../../utils';
import { useToggleSectionState } from '../use-toggle-section-state';

export const useEventScheduleSettingCommonHooks = (
  initialValuesInput: EventSchedule
): Readonly<{
  state: EventScheduleSettingCommonState;
  handlers: EventScheduleSettingCommonStateHandler;
}> => {
  const initialValues = useRef(initialValuesInput);

  const {
    state: title,
    setState: setTitle,
    resetState: resetTitle,
  } = useState<string>(initialValues.current.title);

  const {
    state: notes,
    setState: setNotes,
    resetState: resetNotes,
  } = useState<string>(initialValues.current.notes);

  const {
    state: datetimeSpecification,
    setState: setDatetimeSpecification,
    resetState: resetDatetimeSpecification,
  } = useState<DatetimeSpecificationEnumType>(
    initialValues.current.datetimeSpecification
  );

  const {
    state: datetimeRangeList,
    setState: setDatetimeRangeList,
    resetState: resetDatetimeRangeList,
  } = useState<readonly DatetimeRange[]>(
    initialValues.current.datetimeRangeList
  );

  const {
    toggleState: useAnswerDeadline,
    toggle: toggleAnswerDeadlineSection,
    value: answerDeadline,
    setValue: setAnswerDeadline,
    resetState: resetAnswerDeadlineSection,
    turnOff: turnOffAnswerDeadlineSection,
    turnOn: turnOnAnswerDeadlineSection,
  } = useToggleSectionState<Ymdhm | undefined>({
    initialToggleState: initialValues.current.answerDeadline !== 'none',
    initialState: mapNoneToUndefined(initialValues.current.answerDeadline),
    valueToBeSetWhenTurnedOff: undefined,
    valueToBeSetWhenTurnedOn: initialAnswerDeadline,
  });

  const {
    state: answerIcons,
    setState: setAnswerIcons,
    resetState: resetAnswerIcons,
  } = useState<AnswerIconSettings>(initialValues.current.answerIcons);

  const user = useUser();

  const initialNotificationSettingsWithEmailFilled = useMemo(
    () => ({
      ...initialNotificationSettings,
      email: user?.email ?? '',
    }),
    [user]
  );

  const {
    toggleState: useNotification,
    toggle: toggleNotificationSection,
    value: notificationSettings,
    setValue: setNotificationSettings,
    resetState: resetNotificationSettingsSection,
    turnOff: turnOffNotificationSection,
    turnOn: turnOnNotificationSection,
  } = useToggleSectionState<NotificationSettings | undefined>({
    initialToggleState: initialValues.current.notificationSettings !== 'none',
    initialState: mapNoneToUndefined(
      initialValues.current.notificationSettings
    ),
    valueToBeSetWhenTurnedOff: undefined,
    valueToBeSetWhenTurnedOn: initialNotificationSettingsWithEmailFilled,
  });

  const newEventSchedule: EventSchedule = useMemo(
    () =>
      normalizeEventSchedule({
        title,
        notes,
        datetimeSpecification,
        datetimeRangeList,
        answerDeadline: answerDeadline ?? 'none',
        answerIcons,
        notificationSettings: notificationSettings ?? 'none',
        timezoneOffsetMinutes: eventScheduleDefaultValue.timezoneOffsetMinutes,
        author: {
          id: user?.uid ?? null,
          name: user?.displayName ?? '',
        },
      }),
    [
      title,
      notes,
      datetimeSpecification,
      datetimeRangeList,
      answerDeadline,
      answerIcons,
      notificationSettings,
      user,
    ]
  );

  const hasNoChanges = useMemo<boolean>(
    () => deepEqual(initialValues.current, newEventSchedule),
    [newEventSchedule]
  );

  const eventScheduleValidation = useMemo<EventScheduleValidation>(
    () =>
      validateEventSchedule({
        title,
        datetimeRangeList,
        answerIcons,
        notificationSettings: notificationSettings ?? 'none',
      }),
    [title, datetimeRangeList, answerIcons, notificationSettings]
  );

  const eventScheduleValidationOk = validateEventScheduleAll(
    eventScheduleValidation
  );

  return {
    state: {
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
    },
    handlers: {
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
      turnOffAnswerDeadlineSection,
      turnOnAnswerDeadlineSection,

      setAnswerIcons,
      resetAnswerIcons,

      toggleNotificationSection,
      setNotificationSettings,
      resetNotificationSettingsSection,
      turnOffNotificationSection,
      turnOnNotificationSection,
    },
  };
};
