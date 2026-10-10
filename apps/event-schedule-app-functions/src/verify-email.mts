import { type Firestore } from 'firebase-admin/firestore';
import { getEmail } from './get-event-item.mjs';
import { type VerifyEmailPayload } from './types/index.mjs';

export const verifyEmailImpl = async (
  db: Firestore,
  { email, eventId }: VerifyEmailPayload,
): Promise<'ng' | 'ok'> => {
  const emailExpected = await getEmail(db, eventId);

  return emailExpected === email ? 'ok' : 'ng';
};
