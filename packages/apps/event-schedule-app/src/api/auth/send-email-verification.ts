import { sendEmailVerification as sendEmailVerification_ } from 'firebase/auth';
import { assertIsCredentialError } from '../../types';

export const sendEmailVerification = (
  user: FireAuthUser,
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(sendEmailVerification_(castDeepMutable(user))).then((a) =>
    Result.mapErr(a, (error) => {
      assertIsCredentialError(error);
      return error;
    }),
  );
