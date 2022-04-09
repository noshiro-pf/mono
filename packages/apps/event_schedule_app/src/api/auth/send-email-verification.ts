import { sendEmailVerification as _sendEmailVerification } from 'firebase/auth';
import type { User } from '../../types';
import { assertIsCredentialError } from '../../types';

export const sendEmailVerification = (
  user: User
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(_sendEmailVerification(castWritable(user))).then(
    Result.mapErr((error) => {
      assertIsCredentialError(error);
      return error;
    })
  );
