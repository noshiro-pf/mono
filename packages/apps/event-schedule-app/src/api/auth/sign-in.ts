import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../initialize-firebase';
import { assertIsCredentialError } from '../../types';

export const signIn = (
  email: string,
  password: string
): Promise<
  Result<UserCredential, Readonly<{ code: string; message: string }>>
> =>
  Result.fromPromise(signInWithEmailAndPassword(auth, email, password)).then(
    Result.mapErr((error) => {
      assertIsCredentialError(error);
      return error;
    })
  );
