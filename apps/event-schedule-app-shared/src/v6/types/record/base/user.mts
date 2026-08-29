import { hasKey, isRecord } from 'ts-data-forge';
import {
  isUserId,
  isUserName,
  type UserId,
  type UserName,
} from '../../named-primitive-types.mjs';

export type User = Readonly<{
  id: UserId;
  name: UserName;
}>;

export const userDefaultValue = {
  id: null,
  name: '',
} as const satisfies User;

export const isUser = (a: unknown): a is User =>
  isRecord(a) &&
  hasKey(a, 'id') &&
  isUserId(a.id) &&
  hasKey(a, 'name') &&
  isUserName(a.name);

const d = userDefaultValue;

export const fillUser = (a?: unknown): User =>
  a === undefined || !isRecord(a)
    ? d
    : ({
        id: hasKey(a, 'id') && isUserId(a.id) ? a.id : d.id,
        name: hasKey(a, 'name') && isUserName(a.name) ? a.name : d.name,
      } as const);
