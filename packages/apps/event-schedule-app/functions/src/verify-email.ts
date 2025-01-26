import { type firestore } from 'firebase-admin';
import { getEmail } from './get-event-item.js';
import { type VerifyEmailPayload } from './types/index.js';

export const verifyEmailImpl = async (
  db: firestore.Firestore,
  { email, eventId }: VerifyEmailPayload,
): Promise<'ng' | 'ok'> => {
  const emailExpected = await getEmail(db, eventId);
  return emailExpected === email ? 'ok' : 'ng';
};
