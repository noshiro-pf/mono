import * as t from 'ts-fortress';
import { UserId, UserName } from '../../named-primitive-types.mjs';

export const User = t.record({
  id: UserId,
  name: UserName,
});

export type User = t.TypeOf<typeof User>;
