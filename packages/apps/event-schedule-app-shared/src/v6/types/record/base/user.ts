import { isRecord, Obj } from '@noshiro/ts-utils';
import {
  isUserId,
  isUserName,
  type UserId,
  type UserName,
} from '../../named-primitive-types';

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
  Obj.hasKeyValue(a, 'id', isUserId) &&
  Obj.hasKeyValue(a, 'name', isUserName);

const d = userDefaultValue;

export const fillUser = (a?: unknown): User =>
  a === undefined || !isRecord(a)
    ? d
    : {
        id: Obj.hasKeyValue(a, 'id', isUserId) ? a.id : d.id,
        name: Obj.hasKeyValue(a, 'name', isUserName) ? a.name : d.name,
      };
