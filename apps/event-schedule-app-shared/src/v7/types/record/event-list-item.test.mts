import { expectType } from 'ts-data-forge';
import { type Answer } from './answer.mjs';
import {
  eventListItemDefaultValue,
  fillEventListItem,
  isEventListItem,
  type EventListItem,
} from './event-list-item.mjs';
import {
  eventScheduleDefaultValue,
  type EventSchedule,
} from './event-schedule.mjs';

describe('EventListItem', () => {
  expectType<
    EventListItem,
    Readonly<{
      eventSchedule: EventSchedule;
      eventScheduleMetadata: Readonly<{
        id: string;
        createdAt: string;
        updatedAt: string;
      }>;

      answers: readonly Answer[];
      answersMetadata: Readonly<{
        lastUpdate: string;
      }>;
    }>
  >('=');

  test('defaultValue', () => {
    const defaultValue: EventListItem = {
      eventSchedule: eventScheduleDefaultValue,
      eventScheduleMetadata: {
        id: '',
        createdAt: '',
        updatedAt: '',
      },
      answers: [],
      answersMetadata: {
        lastUpdate: '',
      },
    } as const;

    assert.deepStrictEqual(eventListItemDefaultValue, defaultValue);
  });

  describe('isEventListItem', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(isEventListItem(eventListItemDefaultValue));
    });
  });

  describe('fillEventListItem', () => {
    test('defaultValue should be true', () => {
      assert.deepStrictEqual(fillEventListItem({}), eventListItemDefaultValue);
    });
  });
});
