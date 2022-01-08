import { castWritable, Result } from '@noshiro/ts-utils';
import type { User } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';

export const setDisplayName = (
  user: DeepReadonly<User>,
  displayName: string
): Promise<Result<void, Readonly<{ code: string; message: string }>>> =>
  Result.fromPromise(updateProfile(castWritable(user), { displayName }));
