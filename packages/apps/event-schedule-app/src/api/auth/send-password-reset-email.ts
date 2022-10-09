import { sendPasswordResetEmail as _sendPasswordResetEmail } from 'firebase/auth';
import { fbAuth } from '../../initialize-firebase';
import { assertIsCredentialError } from '../../types';

export const sendPasswordResetEmail = (
  email: string
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(_sendPasswordResetEmail(fbAuth, email)).then(
    Result.mapErr((error) => {
      assertIsCredentialError(error);
      return error;
    })
  );
