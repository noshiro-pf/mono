import { signInWithEmailAndPassword } from 'firebase/auth';
import { Result, castDeepMutable } from 'ts-data-forge';
import { assertIsCredentialError } from '../../types/index.mjs';
import type { FirebaseHandles } from '../firebase.mjs';

export const signIn =
  ({ fbAuth }: FirebaseHandles) =>
  (
    email: string,
    password: string,
  ): Promise<
    Result<UserCredential, Readonly<{ code: string; message: string }>>
  > =>
    Result.fromPromise(
      signInWithEmailAndPassword(castDeepMutable(fbAuth), email, password),
    ).then(
      Result.mapErr((error) => {
        assertIsCredentialError(error);

        return error;
      }),
    );
