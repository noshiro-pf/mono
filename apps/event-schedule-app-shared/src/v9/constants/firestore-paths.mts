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
 *   +-- internal/emailChecks
 *   |     |
 *   |     +-- windowStartMillis
 *   |     +-- count
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
  emailChecks: 'emailChecks',
  windowStartMillis: 'windowStartMillis',
  count: 'count',
} as const;
