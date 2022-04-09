import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../initialize-firebase';
import type { UserCredential } from '../../types';
import { assertIsCredentialError } from '../../types';

export const createUser = (
  email: string,
  password: string
): Promise<
  Result<UserCredential, Readonly<{ code: string; message: string }>>
> =>
  Result.fromPromise(
    createUserWithEmailAndPassword(auth, email, password)
  ).then(
    Result.mapErr((error) => {
      assertIsCredentialError(error);
      return error;
    })
  );
