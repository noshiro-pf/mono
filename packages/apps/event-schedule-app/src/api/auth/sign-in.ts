import { signInWithEmailAndPassword } from 'firebase/auth';
import { fbAuth } from '../../initialize-firebase';
import { assertIsCredentialError } from '../../types';

export const signIn = (
  email: string,
  password: string,
): Promise<
  Result<UserCredential, Readonly<{ code: string; message: string }>>
> =>
  Result.fromPromise(signInWithEmailAndPassword(fbAuth, email, password)).then(
    (a) =>
      Result.mapErr(a, (error) => {
        assertIsCredentialError(error);
        return error;
      }),
  );
