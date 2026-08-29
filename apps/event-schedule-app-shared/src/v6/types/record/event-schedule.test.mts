import {
  eventScheduleDefaultValue,
  fillEventSchedule,
  isEventSchedule,
} from './event-schedule.mjs';

describe('isEventSchedule', () => {
  test('defaultValue should be true', () => {
    assert.isTrue(isEventSchedule(eventScheduleDefaultValue));
  });
});

describe('fillEventSchedule', () => {
  test('defaultValue should be true', () => {
    assert.deepStrictEqual(fillEventSchedule({}), eventScheduleDefaultValue);
  });
});
