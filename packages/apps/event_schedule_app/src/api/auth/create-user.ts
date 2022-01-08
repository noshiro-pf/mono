import { Result } from '@noshiro/ts-utils';
import type { UserCredential } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../initialize-firebase';

export const createUser = (
  email: string,
  password: string
): Promise<
  Result<UserCredential, Readonly<{ code: string; message: string }>>
> => Result.fromPromise(createUserWithEmailAndPassword(auth, email, password));
