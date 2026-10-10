import type {
  AuthCredential as AuthCredential_,
  User as FireAuthUser_,
  OAuthCredential as OAuthCredential_,
  UserCredential as UserCredential_,
} from 'firebase/auth';
import type { DeepReadonly } from 'ts-type-forge';

export type AuthCredential = DeepReadonly<AuthCredential_>;

export type OAuthCredential = DeepReadonly<OAuthCredential_>;

export type UserCredential = DeepReadonly<UserCredential_>;

export type FireAuthUser = DeepReadonly<FireAuthUser_>;
