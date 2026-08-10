import { type ToMutableSet } from 'ts-type-forge';

// embed-sample-code-ignore-above

type ReadOnlyStringSet = ReadonlySet<string>;
type MutableStringSet = ToMutableSet<ReadOnlyStringSet>; // Set<string>

// Converting readonly collections to mutable ones
const convertToMutable = (
  readonlySet: ReadonlySet<string>,
): ReadonlySet<string> => new Set(readonlySet);

// embed-sample-code-ignore-below
export { convertToMutable };
export type { MutableStringSet, ReadOnlyStringSet };
