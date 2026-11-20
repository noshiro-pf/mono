/**
 * Who an event's notification goes to: its author's verified email (from
 * Firebase Auth), and only when that is the email stored in the event's
 * `internal/values`, case aside, as Firebase Auth compares emails. `''`, no
 * one, otherwise — `verified` is `undefined` for an event made signed out, a
 * deleted account, or an account whose email is not verified.
 */
export const recipientOf = (
  stored: string,
  verified: string | undefined,
): string =>
  verified !== undefined &&
  stored !== '' &&
  stored.toLowerCase() === verified.toLowerCase()
    ? verified
    : '';
