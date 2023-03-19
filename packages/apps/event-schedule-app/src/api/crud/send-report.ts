import { httpsCallable } from 'firebase/functions';
import { fbFunctions } from '../../initialize-firebase';

const fbSendReport = httpsCallable(fbFunctions, 'sendReport');

export const sendReport = ({
  error,
}: Readonly<{
  error: string;
}>): Promise<Result<undefined, Readonly<{ message: string }>>> =>
  Result.fromPromise(fbSendReport({ error })).then((a) =>
    Result.fold(
      a,
      () => undefined,
      (result) => ({
        message: Str.from(result),
      })
    )
  );
