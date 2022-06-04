import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { IRecord } from '@noshiro/ts-utils';

export const removeEmailFromEventSchedule = (
  eventSchedule: EventSchedule
): EventSchedule =>
  IRecord.update(
    eventSchedule,
    'notificationSettings',
    (rcd) => (rcd === 'none' ? 'none' : IRecord.set(rcd, 'email', '')) // remove email
  );
