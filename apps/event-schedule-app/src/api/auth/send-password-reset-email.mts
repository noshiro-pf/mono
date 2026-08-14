import { sendPasswordResetEmail as sendPasswordResetEmail_ } from 'firebase/auth';
import { Result } from 'ts-data-forge';
import { fbAuth } from '../../initialize-firebase.mjs';
import { assertIsCredentialError } from '../../types/index.mjs';

export const sendPasswordResetEmail = (
  email: string,
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(sendPasswordResetEmail_(fbAuth, email)).then(
    Result.mapErr((error) => {
      assertIsCredentialError(error);

      return error;
    }),
  );
