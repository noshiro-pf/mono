import * as t from 'ts-fortress';
import {
  userIdTypeDef,
  userNameTypeDef,
} from '../../named-primitive-types.mjs';

export const userTypeDef = t.record({
  id: userIdTypeDef,
  name: userNameTypeDef,
});

export type User = t.TypeOf<typeof userTypeDef>;

export const userDefaultValue = userTypeDef.defaultValue;

export const isUser = userTypeDef.is;

export const fillUser = userTypeDef.fill;
