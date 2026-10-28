import { sendPasswordResetEmail as sendPasswordResetEmail_ } from 'firebase/auth';
import { Result, castDeepMutable } from 'ts-data-forge';
import { assertIsCredentialError } from '../../types/index.mjs';
import type { FirebaseHandles } from '../firebase.mjs';

export const sendPasswordResetEmail =
  ({ fbAuth }: FirebaseHandles) =>
  (
    email: string,
  ): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
    Result.fromPromise(
      sendPasswordResetEmail_(castDeepMutable(fbAuth), email),
    ).then(
      Result.mapErr((error) => {
        assertIsCredentialError(error);

        return error;
      }),
    );
