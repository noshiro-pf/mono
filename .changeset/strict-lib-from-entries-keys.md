---
'strict-ts-lib-v5.0-source': patch
'strict-ts-lib-v5.1-source': patch
'strict-ts-lib-v5.2-source': patch
'strict-ts-lib-v5.3-source': patch
'strict-ts-lib-v5.4-source': patch
'strict-ts-lib-v5.5-source': patch
'strict-ts-lib-v5.6-source': patch
'strict-ts-lib-v5.7-source': patch
'strict-ts-lib-v5.8-source': patch
'strict-ts-lib-v5.9-source': patch
'strict-ts-lib-v6.0-source': patch
'strict-ts-lib-v7.0-source': patch
---

`Object.fromEntries` no longer types a key the entries may not set as present,
nor a repeated key as `never`:

- in a tuple of entries, an entry whose key is a union (`[[k, 1]]` for
  `k: 'x' | 'y'`) makes each of its keys optional (`{ x?: 1; y?: 1 }`); a key an
  earlier entry already set stays present, with either value;
- in a tuple of entries, a later entry replaces an earlier one with the same
  key, as at run time: `[['x', 1], ['x', 2]]` gives `{ x: 2 }`, where it gave
  `never`;
- an iterable that is not an array, such as a `Map<'a' | 'b', number>`, gives
  `Partial<Record<'a' | 'b', number>>` when its key type is a union of literals,
  as an array of entries already did;
- a key type made of index signatures alone (`string | number`, a union of
  template literal types such as `` `a-${string}` | `b-${string}` ``) is no
  longer made `Partial`, from an array or any other iterable, so its values are
  not typed `| undefined`;
- inside a generic function, the result for an iterable that is not an array,
  with key type `K`, is a conditional type that stays unresolved, so it is no
  longer assignable to `Record<K, V>`; the result for an array of entries
  already was not.
