import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';

// The two namespaces hold two versions of one module, side by side under the
// names the rule reads (a top-level `User` and its `TypeOf`), so that the
// README shows both in one block. `Before` holds a value, which
// `erasableSyntaxOnly` refuses in a namespace; nothing runs this file.
// @ts-expect-error TS1294, a namespace that holds a value
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
