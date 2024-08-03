import {
  deleteUser as _deleteUser,
  reauthenticateWithCredential as _reauthenticateWithCredential,
  updateEmail as _updateEmail,
  updatePassword as _updatePassword,
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
  Result.fromPromise(_updateEmail(castDeepMutable(user), email)).then((a) =>
    Result.mapErr(a, (error) => {
      assertIsCredentialError(error);
      return error;
    }),
  );

export const updatePassword = (
  user: FireAuthUser,
  password: string,
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(_updatePassword(castDeepMutable(user), password)).then(
    (a) =>
      Result.mapErr(a, (error) => {
        assertIsCredentialError(error);
        return error;
      }),
  );

export const deleteUser = (
  user: FireAuthUser,
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(_deleteUser(castDeepMutable(user))).then((a) =>
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
    _reauthenticateWithCredential(
      castDeepMutable(user),
      castMutable(authCredential),
    ),
  ).then((a) =>
    Result.mapErr(a, (error) => {
      assertIsCredentialError(error);
      return error;
    }),
  );
