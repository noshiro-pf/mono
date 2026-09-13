import { expectType, hasKey, isRecord, isString } from 'ts-data-forge';
import * as t from 'ts-fortress';

type Project = Readonly<{ name: string; path: string }>;

// embed-sample-code-ignore-above
// ❌
const isProject = (value: unknown): value is Project =>
  isRecord(value) &&
  hasKey(value, 'name') &&
  isString(value.name) &&
  hasKey(value, 'path') &&
  isString(value.path);

// ✅
const PROJECT = t.record({ name: t.string(), path: t.string() });

// embed-sample-code-ignore-below

expectType<t.TypeOf<typeof PROJECT>, Project>('=');

export { isProject, PROJECT };
