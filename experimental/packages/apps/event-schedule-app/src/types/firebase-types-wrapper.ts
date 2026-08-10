/* eslint-disable @typescript-eslint/no-restricted-imports */
import {
  type AuthCredential as AuthCredential_,
  type User as FireAuthUser_,
  type OAuthCredential as OAuthCredential_,
  type UserCredential as UserCredential_,
} from 'firebase/auth';

export type AuthCredential = DeepReadonly<AuthCredential_>;
export type OAuthCredential = DeepReadonly<OAuthCredential_>;
export type UserCredential = DeepReadonly<UserCredential_>;
export type FireAuthUser = DeepReadonly<FireAuthUser_>;
