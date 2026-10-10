import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';

namespace Before {
  // embed-sample-code-ignore-above
  // ❌ — every import of `User` elsewhere is `import type`
  export const User = t.record({ name: t.string() });

  export type User = t.TypeOf<typeof User>;
  // embed-sample-code-ignore-below
}

namespace After {
  // embed-sample-code-ignore-above
  // ✅
  export type User = Readonly<{ name: string }>;
  // embed-sample-code-ignore-below
}

expectType<Before.User, After.User>('=');
