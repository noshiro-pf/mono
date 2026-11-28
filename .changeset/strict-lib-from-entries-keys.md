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

`Object.fromEntries` types more keys as they are set at run time:

- in a tuple of entries, a key with no literal (`string`, `` `p-${string}` ``)
  gives an index signature and widens an earlier key it may overwrite
  (`[['x', 1], [s, 2]]` reads `x` as `1 | 2`);
- a number key sets its string, so `[['0', 'a'], [0, 'b']]` is `{ '0': 'b' }`
  rather than `never`;
- a key mixing a literal with an index signature (`` 'x' | `a-${string}` ``)
  makes the literal optional and leaves the index signature's values without
  `undefined`;
- a branded literal key widens to an index signature of its primitive rather
  than giving an object without it;
- entries that are not a tuple (an array, a `Map`) make each literal key
  optional, even one alone, since they may be empty.
