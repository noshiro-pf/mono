import { hasKeyValue } from 'event-schedule-app-shared';
import type { FirebaseError } from 'firebase/app';
import {
  GoogleAuthProvider,
  reauthenticateWithPopup,
  signInWithPopup,
} from 'firebase/auth';
import {
  Result,
  castDeepMutable,
  isRecord,
  isString,
  unknownToString,
} from 'ts-data-forge';
import type { FirebaseHandles } from '../firebase.mjs';

export const googleSignInWithPopup =
  ({ fbAuth, googleAuthProvider }: FirebaseHandles) =>
  (): Promise<
    Result<OAuthCredential | undefined, OAuthCredential | undefined>
  > =>
    Result.fromPromise(
      signInWithPopup(castDeepMutable(fbAuth), googleAuthProvider),
    ).then(
      Result.fold(
        (result: UserCredential) =>
          // This gives you a Google Access Token. You can use it to access the Google API.
          GoogleAuthProvider.credentialFromResult(castDeepMutable(result)) ??
          undefined,
        (error) =>
          // The AuthCredential type that was used.
          GoogleAuthProvider.credentialFromError(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            error as FirebaseError,
          ) ?? undefined,
      ),
    );

/**
 * Re-authenticates the signed-in user through a Google popup.
 *
 * `reauthenticateWithPopup` rather than `signInWithPopup`: the latter makes
 * whichever Google account is picked the signed-in user, creating it if need
 * be. The error keeps Firebase's code, so that a popup closed on purpose
 * (`auth/popup-closed-by-user`) can be told from a failure; a rejection that
 * carries none is an error too, under the code `unknown`, rather than a throw
 * that would leave the dialog waiting.
 */
export const reauthenticateWithGooglePopup =
  ({ googleAuthProvider }: FirebaseHandles) =>
  (
    user: FireAuthUser,
  ): Promise<
    Result<UserCredential, Readonly<{ code: string; message: string }>>
  > =>
    Result.fromPromise(
      reauthenticateWithPopup(castDeepMutable(user), googleAuthProvider),
    ).then(
      Result.mapErr((error) =>
        isRecord(error) &&
        hasKeyValue(error, 'code', isString) &&
        hasKeyValue(error, 'message', isString)
          ? { code: error.code, message: error.message }
          : { code: 'unknown', message: unknownToString(error) },
      ),
    );
