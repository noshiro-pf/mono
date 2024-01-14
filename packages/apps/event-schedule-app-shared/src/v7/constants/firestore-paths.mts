/**
 * events
 *   |
 *   +-- internal/values
 *   |     |
 *   |     +-- email
 *   |
 *   +-- answers
 *         |
 *         +- answer1
 *         +- answer2
 *         +- ...
 */

export const firestorePaths = {
  events: 'events_v7',
  answers: 'answers',

  internal: 'internal',
  values: 'values',
  email: 'email',
} as const;
