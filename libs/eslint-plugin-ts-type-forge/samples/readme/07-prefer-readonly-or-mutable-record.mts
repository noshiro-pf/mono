/* eslint-disable @stylistic/padding-line-between-statements */
import { expectType } from 'ts-data-forge';
import type { MutableRecord, ReadonlyRecord } from 'ts-type-forge';

{
  // embed-sample-code-ignore-above
  // ❌
  type Config = Record<string, string | number>;
  // embed-sample-code-ignore-below

  expectType<Config, MutableRecord<string, string | number>>('~=');
}

{
  // embed-sample-code-ignore-above
  // ✅
  type Config = ReadonlyRecord<string, string | number>;
  type Counters = MutableRecord<string, number>;
  // embed-sample-code-ignore-below

  expectType<Config, Readonly<Record<string, string | number>>>('=');
  expectType<Counters, Record<string, number>>('~=');
}
