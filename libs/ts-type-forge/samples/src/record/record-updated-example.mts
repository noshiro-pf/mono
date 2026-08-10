import { type RecordUpdated } from 'ts-type-forge';

// embed-sample-code-ignore-above

type Data = { a: { b: [string, boolean] } };
type Updated = RecordUpdated<Data, ['a', 'b', 1], number>;
// Updated = { readonly a: { readonly b: readonly [string, number]; }; }
type UpdatedRoot = RecordUpdated<Data, [], null>; // null

// embed-sample-code-ignore-below
export type { Data, Updated, UpdatedRoot };
