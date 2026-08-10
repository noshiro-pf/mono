import { type ToMutableMap } from 'ts-type-forge';

type User = Readonly<{ id: number; name: string }>;

// embed-sample-code-ignore-above

type ReadOnlyUserMap = ReadonlyMap<string, User>;
type MutableUserMap = ToMutableMap<ReadOnlyUserMap>; // Map<string, User>

// Useful when you need to convert readonly collections to mutable ones
const convertToMutable = (
  readonlyMap: ReadonlyMap<string, number>,
): Map<string, number> => new Map(readonlyMap);

// embed-sample-code-ignore-below
export { convertToMutable };
export type { MutableUserMap, ReadOnlyUserMap };
