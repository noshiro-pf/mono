import { createUserWithEmailAndPassword } from 'firebase/auth';
import { fbAuth } from '../../initialize-firebase';
import { assertIsCredentialError } from '../../types';

export const createUser = (
  email: string,
  password: string,
): Promise<
  Result<UserCredential, Readonly<{ code: string; message: string }>>
> =>
  Result.fromPromise(
    createUserWithEmailAndPassword(fbAuth, email, password),
  ).then((a) =>
    Result.mapErr(a, (error) => {
      assertIsCredentialError(error);
      return error;
    }),
  );
