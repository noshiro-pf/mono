import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Result } from 'ts-data-forge';
import { fbAuth } from '../../initialize-firebase.mjs';
import { assertIsCredentialError } from '../../types/index.mjs';

export const createUser = (
  email: string,
  password: string,
): Promise<
  Result<UserCredential, Readonly<{ code: string; message: string }>>
> =>
  Result.fromPromise(
    createUserWithEmailAndPassword(fbAuth, email, password),
  ).then(
    Result.mapErr((error) => {
      assertIsCredentialError(error);

      return error;
    }),
  );
