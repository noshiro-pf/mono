import { httpsCallable } from 'firebase/functions';
import { Result, unknownToString } from 'ts-data-forge';
import type { FirebaseHandles } from '../firebase.mjs';

export const sendReport = ({ fbFunctions }: FirebaseHandles) => {
  const fbSendReport = httpsCallable(fbFunctions, 'sendReport');

  return ({
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
};
