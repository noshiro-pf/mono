import { getAuth } from 'firebase-admin/auth';
import { isRecord } from 'ts-data-forge';

/**
 * The email of the Firebase Auth account `uid` when it is verified;
 * `undefined` when it is not, or there is no such account.
 */
export const verifiedEmailOf = async (
  uid: string,
): Promise<string | undefined> => {
  try {
    const user = await getAuth().getUser(uid);

    return user.emailVerified ? user.email : undefined;
  } catch (error) {
    if (isRecord(error) && error['code'] === 'auth/user-not-found') {
      return undefined;
    }

    throw error;
  }
};
