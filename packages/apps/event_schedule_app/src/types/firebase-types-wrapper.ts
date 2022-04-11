/* eslint-disable @typescript-eslint/no-restricted-imports */
import type {
  AuthCredential as _AuthCredential,
  OAuthCredential as _OAuthCredential,
  User as _FireAuthUser,
  UserCredential as _UserCredential,
} from 'firebase/auth';

export type AuthCredential = DeepReadonly<_AuthCredential>;
export type OAuthCredential = DeepReadonly<_OAuthCredential>;
export type UserCredential = DeepReadonly<_UserCredential>;
export type FireAuthUser = DeepReadonly<_FireAuthUser>;
