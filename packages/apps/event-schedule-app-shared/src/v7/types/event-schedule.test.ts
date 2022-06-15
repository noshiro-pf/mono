import {
  eventScheduleDefaultValue,
  fillEventSchedule,
  isEventSchedule,
} from './event-schedule';

describe('isEventSchedule', () => {
  test('defaultValue should be true', () => {
    expect(isEventSchedule(eventScheduleDefaultValue)).toBe(true);
  });
});

describe('fillEventSchedule', () => {
  test('defaultValue should be true', () => {
    expect(fillEventSchedule({})).toStrictEqual(eventScheduleDefaultValue);
  });
});
