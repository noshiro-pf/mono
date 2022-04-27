import { hasKeyValue, isNonNullObject } from '@noshiro/ts-utils';
import type { UserId, UserName } from '../../named-primitive-types';
import { isUserId, isUserName } from '../../named-primitive-types';

export type User = Readonly<{
  id: UserId;
  name: UserName;
}>;

export const userDefaultValue: User = {
  id: null,
  name: '',
} as const;

export const isUser = (a: unknown): a is User =>
  isNonNullObject(a) &&
  hasKeyValue(a, 'id', isUserId) &&
  hasKeyValue(a, 'name', isUserName);

const d = userDefaultValue;

export const fillUser = (a?: unknown): User =>
  !isNonNullObject(a)
    ? d
    : {
        id: hasKeyValue(a, 'id', isUserId) ? a.id : d.id,
        name: hasKeyValue(a, 'name', isUserName) ? a.name : d.name,
      };
