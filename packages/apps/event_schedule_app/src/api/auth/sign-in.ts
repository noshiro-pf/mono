import { Result } from '@noshiro/ts-utils';
import type { UserCredential } from 'firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../initialize-firebase';

export const signIn = (
  email: string,
  password: string
): Promise<
  Result<UserCredential, Readonly<{ code: string; message: string }>>
> => Result.fromPromise(signInWithEmailAndPassword(auth, email, password));
