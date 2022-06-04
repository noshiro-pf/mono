import { IRecord, isRecord } from '@noshiro/ts-utils';
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
  isRecord(a) &&
  IRecord.hasKeyValue(a, 'id', isUserId) &&
  IRecord.hasKeyValue(a, 'name', isUserName);

const d = userDefaultValue;

export const fillUser = (a?: unknown): User =>
  a === undefined || !isRecord(a)
    ? d
    : {
        id: IRecord.hasKeyValue(a, 'id', isUserId) ? a.id : d.id,
        name: IRecord.hasKeyValue(a, 'name', isUserName) ? a.name : d.name,
      };
