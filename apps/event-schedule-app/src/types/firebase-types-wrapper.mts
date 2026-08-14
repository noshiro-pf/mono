import {
  type AuthCredential as AuthCredential_,
  type User as FireAuthUser_,
  type OAuthCredential as OAuthCredential_,
  type UserCredential as UserCredential_,
} from 'firebase/auth';
import { type DeepReadonly } from 'ts-type-forge';

export type AuthCredential = DeepReadonly<AuthCredential_>;

export type OAuthCredential = DeepReadonly<OAuthCredential_>;

export type UserCredential = DeepReadonly<UserCredential_>;

export type FireAuthUser = DeepReadonly<FireAuthUser_>;
