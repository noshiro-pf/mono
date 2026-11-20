import { deletedUserId, recipientOf } from './functions/index.mjs';
import { verifiedEmailOf } from './verified-email-of.mjs';

/**
 * Who a notification of the event whose author is `authorId` and whose
 * `internal/values` holds `stored` goes to (`recipientOf`): `''` for an event
 * made signed out or by a deleted account, whose author has no Firebase Auth
 * account to vouch for an email.
 */
export const notificationRecipient = async (
  stored: string,
  authorId: string | null,
): Promise<string> =>
  authorId === null || authorId === deletedUserId || stored === ''
    ? ''
    : recipientOf(stored, await verifiedEmailOf(authorId));
