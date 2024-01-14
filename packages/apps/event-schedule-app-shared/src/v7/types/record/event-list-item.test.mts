import { expectType } from '@noshiro/ts-utils';
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
    };
    expect(eventListItemDefaultValue).toStrictEqual(defaultValue);
  });

  describe('isEventListItem', () => {
    test('defaultValue should be true', () => {
      expect(isEventListItem(eventListItemDefaultValue)).toBe(true);
    });
  });

  describe('fillEventListItem', () => {
    test('defaultValue should be true', () => {
      expect(fillEventListItem({})).toStrictEqual(eventListItemDefaultValue);
    });
  });
});
