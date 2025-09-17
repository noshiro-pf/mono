import { expectType } from 'ts-data-forge';

// embed-sample-code-ignore-above

type UserProfile = Readonly<{
  id: string;
  username: string;
  email: string;
  lastLogin: Date;
  bio?: string;
}>;

// StrictOmit ensures keys actually exist in the source type
type UserCreationData = StrictOmit<UserProfile, 'id' | 'lastLogin'>;

expectType<
  UserCreationData,
  // Result:
  Readonly<{
    username: string;
    email: string;
    bio?: string | undefined;
  }>
>('=');

const newUser: UserCreationData = {
  username: 'jane_doe',
  email: 'jane@example.com',
  bio: 'Software Developer', // Optional
};

// @ts-expect-error 'nonExistentKey' doesn't exist:
type InvalidOmit = StrictOmit<UserProfile, 'id' | 'nonExistentKey'>;

// embed-sample-code-ignore-below
export { newUser, type InvalidOmit };
