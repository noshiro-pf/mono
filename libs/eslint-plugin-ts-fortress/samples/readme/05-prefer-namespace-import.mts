/* eslint-disable @typescript-eslint/no-unused-vars, import-x/first */
import { expectType } from 'ts-data-forge';
// embed-sample-code-ignore-above
// ❌
import { record, string } from 'ts-fortress';
// embed-sample-code-ignore-below

{
  // embed-sample-code-ignore-above
  const User = record({ name: string() });
  // embed-sample-code-ignore-below

  expectType<t.TypeOf<typeof User>, Readonly<{ name: string }>>('=');
}

// embed-sample-code-ignore-above
// ✅
import * as t from 'ts-fortress';
// embed-sample-code-ignore-below

{
  // embed-sample-code-ignore-above
  const User = t.record({ name: t.string() });
  // embed-sample-code-ignore-below

  expectType<t.TypeOf<typeof User>, Readonly<{ name: string }>>('=');
}
