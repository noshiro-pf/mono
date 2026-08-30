import { sendEmailVerification as sendEmailVerification_ } from 'firebase/auth';
import { Result, castDeepMutable } from 'ts-data-forge';
import { assertIsCredentialError } from '../../types/index.mjs';

export const sendEmailVerification = (
  user: FireAuthUser,
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(sendEmailVerification_(castDeepMutable(user))).then(
    Result.mapErr((error) => {
      assertIsCredentialError(error);

      return error;
    }),
  );
