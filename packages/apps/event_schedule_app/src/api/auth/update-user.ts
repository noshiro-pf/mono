import {
  deleteUser as _deleteUser,
  reauthenticateWithCredential as _reauthenticateWithCredential,
  updateEmail as _updateEmail,
  updatePassword as _updatePassword,
  updateProfile,
} from 'firebase/auth';
import type { AuthCredential, User, UserCredential } from '../../types';
import { assertIsCredentialError } from '../../types';

export const updateDisplayName = (
  user: User,
  displayName: string
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(
    updateProfile(castWritable(user), {
      displayName,
    })
  ).then(
    Result.mapErr((error) => {
      assertIsCredentialError(error);
      return error;
    })
  );

export const updateEmail = (
  user: User,
  email: string
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(_updateEmail(castWritable(user), email)).then(
    Result.mapErr((error) => {
      assertIsCredentialError(error);
      return error;
    })
  );

export const updatePassword = (
  user: User,
  password: string
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(_updatePassword(castWritable(user), password)).then(
    Result.mapErr((error) => {
      assertIsCredentialError(error);
      return error;
    })
  );

export const deleteUser = (
  user: User
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(_deleteUser(castWritable(user))).then(
    Result.mapErr((error) => {
      assertIsCredentialError(error);
      return error;
    })
  );

export const reauthenticateWithCredential = (
  user: User,
  authCredential: AuthCredential
): Promise<
  Result<UserCredential, Readonly<{ code: string; message: string }>>
> =>
  Result.fromPromise(
    _reauthenticateWithCredential(
      castWritable(user),
      castWritable(authCredential)
    )
  ).then(
    Result.mapErr((error) => {
      assertIsCredentialError(error);
      return error;
    })
  );
