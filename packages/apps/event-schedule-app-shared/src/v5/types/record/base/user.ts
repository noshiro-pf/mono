import type { UserId, UserName } from '../../named-primitive-types';

export type User = Readonly<{
  id: UserId;
  name: UserName;
}>;

export type PartialUser = Partial<User>;

export const userDefaultValue: User = {
  id: null,
  name: '',
} as const;

const d = userDefaultValue;
export const fillUser = (a: PartialUser): User => ({
  id: a.id ?? d.id,
  name: a.name ?? d.name,
});
