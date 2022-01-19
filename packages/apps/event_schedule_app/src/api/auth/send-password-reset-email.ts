import { Result } from '@noshiro/ts-utils';
import { sendPasswordResetEmail as _sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../initialize-firebase';

export const sendPasswordResetEmail = (
  email: string
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(_sendPasswordResetEmail(auth, email));
