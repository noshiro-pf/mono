import { httpsCallable } from 'firebase/functions';
import { Result, unknownToString } from 'ts-data-forge';
import { fbFunctions } from '../../initialize-firebase.mjs';

const fbSendReport = httpsCallable(fbFunctions, 'sendReport');

export const sendReport = ({
  error,
}: Readonly<{ error: string }>): Promise<
  Result<undefined, Readonly<{ message: string }>>
> =>
  Result.fromPromise(fbSendReport({ error })).then(
    Result.fold(
      () => undefined,
      (result) => ({ message: unknownToString(result) }),
    ),
  );
