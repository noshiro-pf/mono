import { firestorePaths } from '@noshiro/event-schedule-app-shared';

const isEmulatorEnv = process.env['FUNCTIONS_EMULATOR'] === 'true';

export const collectionPath = {
  events: isEmulatorEnv ? firestorePaths.events : firestorePaths.events,
  answers: firestorePaths.answers,
} as const;
