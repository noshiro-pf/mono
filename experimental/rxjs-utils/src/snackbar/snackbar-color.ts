import { hsla } from '@noshiro/ts-utils';

export const snackbarColor = {
  pending: hsla(0, 0, 40, 1),
  success: hsla(123, 41, 45, 1),
  error: hsla(0, 100, 50, 1),
} as const;
