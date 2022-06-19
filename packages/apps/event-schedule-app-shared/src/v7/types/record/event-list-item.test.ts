import { assertType } from '@noshiro/ts-utils';
import type { Answer } from './answer';
import type { EventListItem } from './event-list-item';
import {
  eventListItemDefaultValue,
  fillEventListItem,
  isEventListItem,
} from './event-list-item';
import type { EventSchedule } from './event-schedule';
import { eventScheduleDefaultValue } from './event-schedule';

describe('EventListItem', () => {
  assertType<
    TypeEq<
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
    >
  >();

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
