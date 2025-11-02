/* eslint-disable import-x/first */
const PersonType = t.record({});
// embed-sample-code-ignore-above
import * as t from 'ts-fortress';

// Union types
const IdType = t.union([t.string(), t.number()]);

// Intersection types
const TimestampedType = t.intersection(
  [
    t.record({ data: t.string() }),
    t.record({
      createdAt: t.number(Date.now()),
      updatedAt: t.number(Date.now()),
    }),
  ],
  t.record({
    data: t.string(),
    createdAt: t.number(Date.now()),
    updatedAt: t.number(Date.now()),
  }),
);

// Merge records (similar to intersection but more specific)
const ExtendedUserType = t.mergeRecords([
  PersonType,
  t.record({
    id: t.string(),
    email: t.string(),
  }),
]);

// embed-sample-code-ignore-below
export { ExtendedUserType, IdType, TimestampedType };
