import { sendPasswordResetEmail as sendPasswordResetEmail_ } from 'firebase/auth';
import { fbAuth } from '../../initialize-firebase';
import { assertIsCredentialError } from '../../types';

export const sendPasswordResetEmail = (
  email: string,
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(sendPasswordResetEmail_(fbAuth, email)).then((a) =>
    Result.mapErr(a, (error) => {
      assertIsCredentialError(error);
      return error;
    }),
  );
