/* eslint-disable import-x/first */
const IGNORE_EMBEDDING = (..._args: readonly unknown[]): void => {};

// embed-sample-code-ignore-above
import * as t from 'ts-fortress';

// Simple branded types
const UserId = t.brandedString({ typeName: 'UserId', defaultValue: '' });

const Weight = t.brandedNumber({ typeName: 'Weight', defaultValue: 0 });

type UserId = t.TypeOf<typeof UserId>; // Brand<string, 'UserId'>

type Weight = t.TypeOf<typeof Weight>; // Brand<number, 'Weight'>

// Rich number validation types
const PositiveInt = t.positiveInt(1);

const SafeInt = t.safeInt(0);

const UInt16 = t.uint16(0);

// Usage
const userIdResult = UserId.validate('user_123');

assert.isTrue(t.Result.isOk(userIdResult));

if (t.Result.isOk(userIdResult)) {
  const id: UserId = userIdResult.value;

  IGNORE_EMBEDDING(id);
}

// embed-sample-code-ignore-below
export { PositiveInt, SafeInt, UInt16, UserId, Weight };
