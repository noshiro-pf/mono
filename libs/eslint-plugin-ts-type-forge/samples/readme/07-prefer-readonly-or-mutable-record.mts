/* eslint-disable @stylistic/padding-line-between-statements */
import { expectType } from 'ts-data-forge';
import { type MutableRecord, type ReadonlyRecord } from 'ts-type-forge';

// embed-sample-code-ignore-above
/* embed-sample-code-ignore-this-line */ // prettier-ignore
/* embed-sample-code-ignore-this-line */ {
  // ❌
  type Config = Record<string, string | number>;

  /* embed-sample-code-ignore-this-line */ expectType<Config, MutableRecord<string, string | number>>('~=');
/* embed-sample-code-ignore-this-line */ }

/* embed-sample-code-ignore-this-line */ // prettier-ignore
/* embed-sample-code-ignore-this-line */ {
  // ✅
  type Config = ReadonlyRecord<string, string | number>;
  type Counters = MutableRecord<string, number>;

  /* embed-sample-code-ignore-this-line */ expectType<Config, Readonly<Record<string, string | number>>>('=');
  /* embed-sample-code-ignore-this-line */ expectType<Counters, Record<string, number>>('~=');
/* embed-sample-code-ignore-this-line */ }
