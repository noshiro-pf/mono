/**
 * ```txt
 * events
 *   |
 *   +-- internal/values
 *   |     |
 *   |     +-- email
 *   |
 *   +-- internal/closingMail
 *   |     |
 *   |     +-- deadlineMillis
 *   |     +-- claimId
 *   |
 *   +-- answers
 *         |
 *         +-- answer1
 *         +-- answer2
 *         +-- ...
 * ```
 */

export const firestorePaths = {
  events: 'events_v7',
  answers: 'answers',
  internal: 'internal',
  values: 'values',
  email: 'email',
  closingMail: 'closingMail',
  deadlineMillis: 'deadlineMillis',
  claimId: 'claimId',
} as const;
