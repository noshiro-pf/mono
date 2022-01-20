import { castWritable, Result } from '@noshiro/ts-utils';
import type { AuthCredential, User, UserCredential } from 'firebase/auth';
import {
  reauthenticateWithCredential as _reauthenticateWithCredential,
  updateEmail as _updateEmail,
  updatePassword as _updatePassword,
  updateProfile,
} from 'firebase/auth';
import { assertIsCredentialError } from '../../types';

export const updateDisplayName = (
  user: DeepReadonly<User>,
  displayName: string
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(
    updateProfile(castWritable(user), {
      displayName,
    })
  );

export const updateEmail = (
  user: DeepReadonly<User>,
  email: string
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(_updateEmail(castWritable(user), email));

export const updatePassword = (
  user: DeepReadonly<User>,
  password: string
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(_updatePassword(castWritable(user), password));

export const reauthenticateWithCredential = (
  user: DeepReadonly<User>,
  authCredential: DeepReadonly<AuthCredential>
): Promise<
  Result<
    DeepReadonly<UserCredential>,
    Readonly<{ code: string; message: string }>
  >
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
