/* eslint-disable @stylistic/padding-line-between-statements */
import { expectType } from 'ts-data-forge';
import {
  type Mutable,
  type MutableRecord,
  type ReadonlyRecord,
} from 'ts-type-forge';

type Item = Readonly<{ id: string }>;

// embed-sample-code-ignore-above
/* embed-sample-code-ignore-this-line */ // prettier-ignore
/* embed-sample-code-ignore-this-line */ {
  // ❌
  type Counters = Mutable<Record<string, number>>;
  type Draft = Mutable<ReadonlyRecord<string, Item>>;

  /* embed-sample-code-ignore-this-line */ expectType<Counters, MutableRecord<string, number>>('=');
  /* embed-sample-code-ignore-this-line */ expectType<Draft, MutableRecord<string, Item>>('=');
/* embed-sample-code-ignore-this-line */ }

/* embed-sample-code-ignore-this-line */ // prettier-ignore
/* embed-sample-code-ignore-this-line */ {
  // ✅
  type Counters = MutableRecord<string, number>;
  type Draft = MutableRecord<string, Item>;

  /* embed-sample-code-ignore-this-line */ expectType<Counters, Mutable<Record<string, number>>>('=');
  /* embed-sample-code-ignore-this-line */ expectType<Draft, Mutable<ReadonlyRecord<string, Item>>>('=');
/* embed-sample-code-ignore-this-line */ }
