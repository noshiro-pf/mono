/* eslint-disable import-x/no-unassigned-import, @stylistic/padding-line-between-statements */
// embed-sample-code-ignore-above
// ❌
import 'ts-type-forge';

// ✅ types are reached by name
import { type NonEmptyArray } from 'ts-type-forge';

// embed-sample-code-ignore-below

export type Names = NonEmptyArray<string>;
