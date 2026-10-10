/* eslint-disable @stylistic/padding-line-between-statements */
import { expectType } from 'ts-data-forge';
import type { RelaxedExclude, StrictExclude, StrictOmit } from 'ts-type-forge';

type Person = Readonly<{ name: string; email: string }>;

{
  // embed-sample-code-ignore-above
  // ❌
  type Remaining = Exclude<'a' | 'b' | 'c', 'a'>;
  type PublicInfo = Omit<Person, 'email'>;
  // embed-sample-code-ignore-below

  expectType<Remaining, 'b' | 'c'>('=');
  expectType<PublicInfo, Readonly<{ name: string }>>('=');
}

{
  // embed-sample-code-ignore-above
  // ✅ — the key is checked against the union / `keyof T`
  type Remaining = StrictExclude<'a' | 'b' | 'c', 'a'>;
  type PublicInfo = StrictOmit<Person, 'email'>;

  // ✅ — deliberately unchecked (the subtrahend need not be part of `T`)
  type NonStrings = RelaxedExclude<string | number | boolean, string>;
  // embed-sample-code-ignore-below

  expectType<Remaining, 'b' | 'c'>('=');
  expectType<PublicInfo, Readonly<{ name: string }>>('=');
  expectType<NonStrings, number | boolean>('=');
}
