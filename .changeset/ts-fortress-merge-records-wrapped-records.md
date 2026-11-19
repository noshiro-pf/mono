---
'ts-fortress': patch
---

`t.mergeRecords` prunes, repairs and defaults a key that several records declare, and whose members wrap records in a union, an array or a tuple, as the records merged:

- `prune` kept every key under it, since the key was pruned as `t.intersection` prunes members that are not all records; it now keeps the keys some member declares, element by element in an array, so merging `t.record({ p: t.array(t.record({ x: t.number() })) })` with `t.record({ p: t.array(t.record({ y: t.number() })) })` prunes `{ p: [{ x: 1, y: 2, secret: 3 }] }` to `{ p: [{ x: 1, y: 2 }] }`.
- `fill` repaired such a key to its default, `[]` for those arrays, when no member's own repair satisfied every member; it now first tries the members' repairs merged, which repairs `{ p: [{ x: 1 }] }` to `{ p: [{ x: 1, y: 0 }] }`. Arrays that a member's repair makes shorter than the value, by dropping elements (`onInvalidElement: 'drop'`) or by cutting them to a maximum length, are not merged element by element, since a dropped element would merge one element of the value with another. Members `t.union([t.nullType, t.record({ x })])` and `t.union([t.nullType, t.record({ y })])` repair `{ p: { x: 1 } }` to `{ p: { x: 1, y: 0 } }`, as `t.union` now repairs a record by its closest record member.
- The default, when no member's default satisfies every member, is the members' defaults merged where every member accepts them, so tuples `t.tuple([t.record({ x })])` and `t.tuple([t.record({ y })])` default to `[{ x: 0, y: 0 }]` rather than to the last member's `[{ y: 0 }]`, which the key rejects.

`t.intersection` of records, and `t.mergeRecords` at such a key, keep a `Map`, a `Set` or a `Date` under a key that several members share when they prune it, where they replaced it with `{}`; where the members prune its contents differently (a `t.MapType` of different records), the last member's is kept.
