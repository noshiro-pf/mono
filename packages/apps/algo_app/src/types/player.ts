import {
  hasKeyValue,
  isBoolean,
  isNonNullObject,
  isString,
} from '@noshiro/ts-utils';

export type Player = Readonly<{
  // id: string;
  name: string;
  online: boolean;
}>;

export const isPlayer = (data: unknown): data is Player =>
  isNonNullObject(data) &&
  // hasKeyValue(data, 'id', isString) &&
  hasKeyValue(data, 'name', isString) &&
  hasKeyValue(data, 'online', isBoolean);
