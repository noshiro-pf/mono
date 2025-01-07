import { expectType } from '@noshiro/ts-utils';
import { type Answer } from './answer.mjs';
import { EventListItem } from './event-list-item.mjs';
import { EventSchedule } from './event-schedule.mjs';

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
      eventSchedule: EventSchedule.defaultValue,
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
    expect(EventListItem.defaultValue).toStrictEqual(defaultValue);
  });

  describe('is', () => {
    test('defaultValue should be true', () => {
      expect(EventListItem.is(EventListItem.defaultValue)).toBe(true);
    });
  });

  describe('fill', () => {
    test('fill result should be the defaultValue', () => {
      expect(EventListItem.fill({})).toStrictEqual(EventListItem.defaultValue);
    });
  });
});
