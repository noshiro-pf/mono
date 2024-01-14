import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import * as t from '@noshiro/io-ts';

const emailDataTypeDef = t.record({
  [firestorePaths.email]: t.string(''),
});

export type EmailData = t.TypeOf<typeof emailDataTypeDef>;

export const isEmailData = emailDataTypeDef.is;
