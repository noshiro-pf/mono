// No import needed if using triple-slash directive
// import type { TypeEq, TypeExtends } from 'ts-type-forge'; // if importing explicitly

type User = { id: number; name: string };

type Admin = { id: number; name: string; role: 'admin' };

// Check exact type equality
type IsExactMatch = TypeEq<User, Admin>; // false

type IsSameType = TypeEq<User, User>; // true

// Check type extension relationships
type AdminExtendsUser = TypeExtends<Admin, User>; // true

type UserExtendsAdmin = TypeExtends<User, Admin>; // false

// Use in conditional types
type GetUserType<T> =
  TypeExtends<T, Admin> extends true
    ? 'admin'
    : TypeExtends<T, User> extends true
      ? 'user'
      : 'unknown';

type AdminType = GetUserType<Admin>; // 'admin'

type UserType = GetUserType<User>; // 'user'

// embed-sample-code-ignore-below
export type {
  AdminExtendsUser,
  AdminType,
  IsExactMatch,
  IsSameType,
  UserExtendsAdmin,
  UserType,
};
