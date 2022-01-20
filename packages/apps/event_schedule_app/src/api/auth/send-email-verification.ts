import { castWritable, Result } from '@noshiro/ts-utils';
import type { User } from 'firebase/auth';
import { sendEmailVerification as _sendEmailVerification } from 'firebase/auth';
import { assertIsCredentialError } from '../../types';

export const sendEmailVerification = (
  user: DeepReadonly<User>
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(_sendEmailVerification(castWritable(user))).then(
    Result.mapErr((error) => {
      assertIsCredentialError(error);
      return error;
    })
  );
