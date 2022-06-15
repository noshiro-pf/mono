import type { firestore } from 'firebase-admin';
import { getEmail } from './get-event-item';

export const testEmailImpl = async (
  db: firestore.Firestore,
  {
    email,
    eventId,
  }: Readonly<{
    eventId: string;
    email: string;
  }>
): Promise<'ng' | 'ok'> => {
  const emailExpected = await getEmail(db, eventId);
  return emailExpected === email ? 'ok' : 'ng';
};
