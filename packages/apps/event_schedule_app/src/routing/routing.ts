import { ComponentType } from 'react';
import { CreateEventSchedule } from '../components/pages/create-event-schedule';
import { UiPartsTest } from '../components/pages/ui-parts-test';

export const routing: [string, ComponentType][] = [
  ['/', CreateEventSchedule],
  ['/ui-parts-test', UiPartsTest],
  ['/create-event-schedule', CreateEventSchedule],
];
