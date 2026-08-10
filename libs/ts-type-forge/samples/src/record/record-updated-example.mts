import { type RecordUpdated } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = Readonly<{ a: Readonly<{ b: readonly [string, boolean] }> }>;
type Updated = RecordUpdated<Data, readonly ['a', 'b', 1], number>;
// Updated = { readonly a: { readonly b: readonly [string, number]; }; }
type UpdatedRoot = RecordUpdated<Data, readonly [], null>; // null

// embed-sample-code-ignore-below
export type { Data, Updated, UpdatedRoot };
