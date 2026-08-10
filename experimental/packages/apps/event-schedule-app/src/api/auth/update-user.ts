import {
  deleteUser as deleteUser_,
  reauthenticateWithCredential as reauthenticateWithCredential_,
  updateEmail as updateEmail_,
  updatePassword as updatePassword_,
  updateProfile,
} from 'firebase/auth';
import { assertIsCredentialError } from '../../types';

export const updateDisplayName = (
  user: FireAuthUser,
  displayName: string,
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(
    updateProfile(castDeepMutable(user), {
      displayName,
    }),
  ).then((a) =>
    Result.mapErr(a, (error) => {
      assertIsCredentialError(error);
      return error;
    }),
  );

export const updateEmail = (
  user: FireAuthUser,
  email: string,
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(updateEmail_(castDeepMutable(user), email)).then((a) =>
    Result.mapErr(a, (error) => {
      assertIsCredentialError(error);
      return error;
    }),
  );

export const updatePassword = (
  user: FireAuthUser,
  password: string,
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(updatePassword_(castDeepMutable(user), password)).then(
    (a) =>
      Result.mapErr(a, (error) => {
        assertIsCredentialError(error);
        return error;
      }),
  );

export const deleteUser = (
  user: FireAuthUser,
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(deleteUser_(castDeepMutable(user))).then((a) =>
    Result.mapErr(a, (error) => {
      assertIsCredentialError(error);
      return error;
    }),
  );

export const reauthenticateWithCredential = (
  user: FireAuthUser,
  authCredential: AuthCredential,
): Promise<
  Result<UserCredential, Readonly<{ code: string; message: string }>>
> =>
  Result.fromPromise(
    reauthenticateWithCredential_(
      castDeepMutable(user),
      castMutable(authCredential),
    ),
  ).then((a) =>
    Result.mapErr(a, (error) => {
      assertIsCredentialError(error);
      return error;
    }),
  );
