import { type UserId, type UserName } from '../../named-primitive-types.mjs';

export type User = Readonly<{
  id: UserId;
  name: UserName;
}>;

export type PartialUser = Partial<User>;

export const userDefaultValue = {
  id: null,
  name: '',
} as const satisfies User;

const d = userDefaultValue;
export const fillUser = (a: PartialUser): User => ({
  id: a.id ?? d.id,
  name: a.name ?? d.name,
});
