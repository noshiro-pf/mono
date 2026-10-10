import { firestorePaths } from 'event-schedule-app-shared';
import * as t from 'ts-fortress';

const emailDataTypeDef = t.record({
  [firestorePaths.email]: t.string(''),
});

export type EmailData = t.TypeOf<typeof emailDataTypeDef>;

export const isEmailData = emailDataTypeDef.is;
