/* cSpell:disable */

import { expectType } from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { email } from './email.mjs';

// https://github.com/validatorjs/validator.js/blob/13.15.15/test/validators.test.js

const validSamples = [
  'foo@bar.com',
  'x@x.au',
  'foo@bar.com.au',
  'foo+bar@bar.com',
  // 'hans.m端ller@test.com',
  // 'hans@m端ller.com',
  // 'test|123@m端ller.com',
  'test123+ext@gmail.com',
  'some.name.midd.leNa.me.and.locality+extension@GoogleMail.com',
  // '"foobar"@example.com',
  // '"  foo  m端ller "@example.com',
  // '"foo\\@bar"@example.com',
  `${'a'.repeat(64)}@${'a'.repeat(63)}.com`,
  `${'a'.repeat(31)}@gmail.com`,
  'test@gmail.com',
  'test.1@gmail.com',
  'test@1337.com',
] as const satisfies readonly string[];

const invalidSamples = [
  'invalidemail@',
  'invalid.com',
  '@invalid.com',
  'foo@bar.com.',
  'foo@_bar.com',
  'somename@ｇｍａｉｌ.com',
  'foo@bar.co.uk.',
  // 'z@co.c',
  'ｇｍａｉｌｇｍａｉｌｇｍａｉｌｇｍａｉｌｇｍａｉｌ@gmail.com',
  `${'a'.repeat(64)}@${'a'.repeat(251)}.com`,
  `${'a'.repeat(65)}@${'a'.repeat(250)}.com`,
  `${'a'.repeat(64)}@${'a'.repeat(64)}.com`,
  // `${'a'.repeat(64)}@${'a'.repeat(63)}.${'a'.repeat(63)}.${'a'.repeat(63)}.${'a'.repeat(58)}.com`,
  'test1@invalid.co m',
  'test2@invalid.co m',
  'test3@invalid.co m',
  'test4@invalid.co m',
  'test5@invalid.co m',
  'test6@invalid.co m',
  'test7@invalid.co m',
  'test8@invalid.co m',
  'test9@invalid.co m',
  'test10@invalid.co m',
  'test11@invalid.co m',
  'test12@invalid.co　m',
  'test13@invalid.co　m',
  // 'multiple..dots@stillinvalid.com',
  'test123+invalid! sub_address@gmail.com',
  // 'gmail...ignores...dots...@gmail.com',
  // 'ends.with.dot.@gmail.com',
  // 'multiple..dots@gmail.com',
  'wrong()[]",:;<>@@gmail.com',
  '"wrong()[]",:;<>@@gmail.com',
  'username@domain.com�',
  'username@domain.com©',
  'nbsp test@test.com',
  'nbsp_test@te st.com',
  'nbsp_test@test.co m',
  '"foobar@gmail.com',
  '"foo"bar@gmail.com',
  'foo"bar"@gmail.com',
] as const satisfies readonly string[];

describe(email, () => {
  const baseType = email();

  type EmailType = TypeOf<typeof baseType>;

  expectType<EmailType, string>('<=');
  expectType<typeof baseType.defaultValue, EmailType>('=');

  test.each(validSamples)('should accept $0', (e) => {
    expect(baseType.is(e)).toBe(true);
  });

  test.each(invalidSamples)('should reject $0', (e) => {
    expect(baseType.is(e)).toBe(false);
  });
});
