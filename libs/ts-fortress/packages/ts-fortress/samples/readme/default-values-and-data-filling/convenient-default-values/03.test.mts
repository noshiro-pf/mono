import * as t from 'ts-fortress';

// Using mergeRecords for record-only intersections
const UserWithMetadata = t.mergeRecords([
  t.record({
    id: t.string(),
    name: t.string(),
  }),
  t.record({
    createdAt: t.number(),
    updatedAt: t.number(),
  }),
  // No explicit default needed - automatically combines defaults from both records
]);

assert.deepStrictEqual(UserWithMetadata.defaultValue, {
  id: '',
  name: '',
  createdAt: 0,
  updatedAt: 0,
} satisfies t.TypeOf<typeof UserWithMetadata>);
