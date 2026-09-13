/* eslint-disable @typescript-eslint/no-unused-vars, @stylistic/padding-line-between-statements, import-x/first */
import { expectType } from 'ts-data-forge';
// embed-sample-code-ignore-above
// ❌
import { record, string } from 'ts-fortress';

/* embed-sample-code-ignore-this-line */ // prettier-ignore
/* embed-sample-code-ignore-this-line */ {
const User = record({ name: string() });
/* embed-sample-code-ignore-this-line */ expectType<t.TypeOf<typeof User>, Readonly<{ name: string }>>('=');
/* embed-sample-code-ignore-this-line */ }

// ✅
import * as t from 'ts-fortress';

/* embed-sample-code-ignore-this-line */ // prettier-ignore
/* embed-sample-code-ignore-this-line */ {
const User = t.record({ name: t.string() });
/* embed-sample-code-ignore-this-line */ expectType<t.TypeOf<typeof User>, Readonly<{ name: string }>>('=');
/* embed-sample-code-ignore-this-line */ }
