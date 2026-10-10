/* eslint-disable @stylistic/padding-line-between-statements */
import { expectType } from 'ts-data-forge';
import {
  type Mutable,
  type MutableRecord,
  type ReadonlyRecord,
} from 'ts-type-forge';

type Item = Readonly<{ id: string }>;

{
  // embed-sample-code-ignore-above
  // ❌
  type Counters = Mutable<Record<string, number>>;
  type Draft = Mutable<ReadonlyRecord<string, Item>>;
  // embed-sample-code-ignore-below

  expectType<Counters, MutableRecord<string, number>>('=');
  expectType<Draft, MutableRecord<string, Item>>('=');
}

{
  // embed-sample-code-ignore-above
  // ✅
  type Counters = MutableRecord<string, number>;
  type Draft = MutableRecord<string, Item>;
  // embed-sample-code-ignore-below

  expectType<Counters, Mutable<Record<string, number>>>('=');
  expectType<Draft, Mutable<ReadonlyRecord<string, Item>>>('=');
}
