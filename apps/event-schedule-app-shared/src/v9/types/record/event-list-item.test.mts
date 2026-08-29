import { expectType } from 'ts-data-forge';
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
        createdAtMillis?: number;
        updatedAt: string;
        updatedAtMillis?: number;
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
        createdAtMillis: 0,
        updatedAt: '',
        updatedAtMillis: 0,
      },
      answers: [],
      answersMetadata: {
        lastUpdate: '',
      },
    } as const;

    assert.deepStrictEqual(EventListItem.defaultValue, defaultValue);
  });

  describe('is', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(EventListItem.is(EventListItem.defaultValue));
    });
  });

  describe('fill', () => {
    test('fill result should be the defaultValue', () => {
      assert.deepStrictEqual(
        EventListItem.fill({}),
        EventListItem.defaultValue,
      );
    });
  });
});
