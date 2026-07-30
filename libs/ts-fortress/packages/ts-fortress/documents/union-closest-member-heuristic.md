## How a union picks the member to blame

Design notes for the closest-member heuristic in `src/compose/union.mts`, and the scenarios the scoring rule was chosen against.

### The problem

When a value matches no member of a union, the obvious message lists every member. That works for `"red" | "green" | "blue"` and falls apart for anything wider:

```text
Error: expected one of <{ kind: "circle", radius: number }>, <{ kind: "square", size: number }>, <{ kind: "rectangle", width: number, height: number }> but <object> type value was passed.
```

The reader has to diff the value against three type names to find out that a single field was wrong. In practice a rejected value usually satisfies almost all of one member, so the useful message is that member's own errors. Once the `|`-joined member listing passes `UNION_MEMBER_LISTING_MAX_LENGTH` (60 characters), the union reports one member instead of all of them:

```text
Error: the value did not match any of the 3 members of the union; the closest member type is <{ kind: "circle", radius: number }>, which failed as follows:
Error at radius: expected <number> type but <string> type value "5" was passed.
```

That leaves one question, which is what this document is about: **which member is the closest one?**

### The rule

Selection runs in two steps.

1. **Filter by runtime type category.** Keep the members whose default value has the same runtime type as the value (`string`, `number`, `array`, `Map`, `object`, …). No member accepted the value, so this can never discard a member that would have matched; it only decides who is worth reporting. If nothing survives, the union reports the categories it accepts instead of a member.
2. **Score the survivors.** Each candidate is validated and scored as _failed checks − passed checks_ — lower is closer. Ties go to the member that passed more checks, and members equal on both are all named, with the first in declaration order reporting its errors (the same order `prune` and `fill` use).

```ts
const satisfiedCheckCount = Math.max(
    0,
    checkCountOf(memberType) - errors.length,
);
const score = errors.length - satisfiedCheckCount;
```

`checkCountOf` is how many checks a member performs on a value: the number of keys for a record, the number of elements for a tuple, and `1` for everything else, which either matches or does not.

### The scenarios

Every scenario below is real code, and the numbers are what the implementation computes. `failed` is the length of the member's own `ValidationError[]`, `checks` is `checkCountOf`, and `passed` is `checks - failed` clamped at zero.

#### Scenario 1 — a discriminated union with one wrong field

```ts
const circle = record({ kind: literal('circle'), radius: number() });
const square = record({ kind: literal('square'), size: number() });
const rectangle = record({
    kind: literal('rectangle'),
    width: number(),
    height: number(),
});

union([circle, square, rectangle]).validate({ kind: 'circle', radius: '5' });
```

| member      | failed | checks | passed | score | reported |
| :---------- | -----: | -----: | -----: | ----: | :------- |
| `circle`    |      1 |      2 |      1 |     0 | ✅       |
| `square`    |      2 |      2 |      0 |     2 |          |
| `rectangle` |      3 |      3 |      0 |     3 |          |

```text
Error: the value did not match any of the 3 members of the union; the closest member type is <{ kind: "circle", radius: number }>, which failed as follows:
Error at radius: expected <number> type but <string> type value "5" was passed.
```

The discriminant does the work: every other variant fails on `kind` _and_ on its own missing fields.

#### Scenario 2 — a small unrelated member vs. a larger near-match

```ts
const config = record({
    kind: literal('config'),
    host: string(),
    port: number(),
});
const note = record({ note: string() });

union([config, note]).validate({
    kind: 'config',
    host: 5,
    port: 'not a number',
});
```

| member   | failed | checks | passed | score | reported |
| :------- | -----: | -----: | -----: | ----: | :------- |
| `config` |      2 |      3 |      1 |     1 | ✅       |
| `note`   |      1 |      1 |      0 |     1 |          |

This is the case plain error counting gets wrong: `note` fails one check and `config` fails two, yet the value is obviously an attempt at a `config`. Crediting passed checks puts them level at `1`, and the tie-break — more passed checks — picks `config`.

#### Scenario 3 — a large member the value mostly satisfies

```ts
const account = record({
    id: number(),
    name: string(),
    email: string(),
    role: string(),
    age: number(),
});
const label = record({ label: string() });

union([account, label]).validate({
    id: 1,
    name: 'Ada',
    email: 'ada@example.com',
    role: 7,
    age: 'unknown',
});
```

| member    | failed | checks | passed | score | reported |
| :-------- | -----: | -----: | -----: | ----: | :------- |
| `account` |      2 |      5 |      3 |    −1 | ✅       |
| `label`   |      1 |      1 |      0 |     1 |          |

```text
Error: the value did not match any of the 2 members of the union; the closest member type is <{ id: number, name: string, email: string, role: string, age: number }>, which failed as follows:
Error at role: expected <string> type but <number> type value `7` was passed.
Error at age: expected <number> type but <string> type value "unknown" was passed.
```

Reporting two real errors beats reporting one useless one (`missing required key "label"`), which is what error counting alone would have produced.

#### Scenario 4 — the same members, a value that means neither

```ts
union([account, label]).validate({ id: 1 });
```

| member    | failed | checks | passed | score | reported |
| :-------- | -----: | -----: | -----: | ----: | :------- |
| `account` |      4 |      5 |      1 |     3 |          |
| `label`   |      1 |      1 |      0 |     1 | ✅       |

This is the mirror image of scenario 3 and the reason the scoring is _not_ a ratio. `account` is `4/5` wrong and `label` is `1/1` wrong, so a ratio would report `account` and dump four errors on the reader for a value that has one key. Subtracting keeps the absolute cost of being wrong in the score.

#### Scenario 5 — nothing in the value points at a variant

```ts
union([circle, square, rectangle]).validate({});
```

| member      | failed | checks | passed | score | reported    |
| :---------- | -----: | -----: | -----: | ----: | :---------- |
| `circle`    |      2 |      2 |      0 |     2 | ✅ (errors) |
| `square`    |      2 |      2 |      0 |     2 | ✅ (named)  |
| `rectangle` |      3 |      3 |      0 |     3 |             |

```text
Error: the value did not match any of the 3 members of the union; the closest member types are <{ kind: "circle", radius: number }>, <{ kind: "square", size: number }>; the first of them failed as follows:
Error at kind: missing required key "kind".
Error at radius: missing required key "radius".
```

`circle` and `square` are equal on both keys, so both are named rather than one being picked silently. If the names the clause adds would themselves pass `UNION_MEMBER_LISTING_MAX_LENGTH`, they are replaced by their count (`3 members are equally close; <…> failed as follows:`) — the same bound that made the union stop listing its members in the first place, applied to the names this clause adds.

### Why this scoring

Five candidate metrics were run against the scenarios above. _errors_ is the member's error count, _checks_ its `checkCountOf`, and _passed_ is `checks - errors`.

| metric                         | 1 discriminated | 2 small unrelated | 3 large near-match | 4 value means neither | 5 empty value |
| :----------------------------- | :-------------- | :---------------- | :----------------- | :-------------------- | :------------ |
| `errors` (the original)        | ✅              | ❌ `note`         | ❌ `label`         | ✅                    | ✅            |
| `errors / checks`              | ✅              | ✅                | ✅                 | ❌ `account`          | 3-way tie     |
| `-passed`                      | ✅              | ✅                | ✅                 | ❌ `account`          | 3-way tie     |
| **`errors - passed`** (chosen) | ✅              | ✅ (tie-break)    | ✅                 | ✅                    | ✅            |
| `errors - 1.5 × passed`        | ✅              | ✅                | ✅                 | ✅                    | ✅            |

- **Error count alone** penalizes a member for being large: every key it declares is another chance to report an error, so a one-key member that the value ignores entirely outranks the member the value was actually trying to be (scenarios 2 and 3).
- **A ratio** (and the equivalent _maximize passed_) fixes that by throwing away scale, and then loses scenario 4: a mostly-wrong big member wins on percentage and the message becomes a wall of errors. It also flattens scenario 5 into a three-way tie, because _everything failed_ is `1.0` regardless of size.
- **Subtraction** keeps both terms in absolute units: a member is credited once per check the value satisfied and debited once per check it failed. It is the only unweighted rule that gets every scenario right, and its one tie (scenario 2) is broken by the more specific question — which member recognized more of the value.
- **Weighting the credit** (`1.5×`) also passes, but the constant is not derived from anything and would need re-tuning against every new scenario, so it was not chosen.

### Known limits

- `checkCountOf` is only meaningful for records and tuples. Everything else counts as one check, so within a category of primitives the scoring degrades to plain error counting — which is the right answer there, since those members have nothing partial to satisfy.
- A record whose shape cannot be flattened to one set of keys (a union of shapes reached through `recursion`) also counts as one check, and is therefore scored as if it were a primitive.
- A record that rejects excess properties can report more errors than it has keys; `passed` is clamped at zero rather than going negative.
- Scoring validates every candidate. This only happens on the failure path, after the value has already been rejected by every member.

### Appendix — why nested unions are flattened

A union taken directly as a member of another union contributes its own members instead of itself:

```ts
const tagOrCode = union([literal('alpha'), literal(42)]);
const shape = union([tagOrCode, circle, square]);
// members: literal('alpha'), literal(42), circle, square
```

`A | (B | C)` and `A | B | C` describe the same set of values, so this changes nothing about what the union accepts. It matters for step 1 of the selection: a member is filed under _one_ runtime type category, taken from its default value, and a nested union has only one default value. Unflattened, `tagOrCode` would be filed under `string` (its default is `'alpha'`), so validating `41` would leave no candidate at all and the union would fall back to reporting its categories. Flattened, the `42` member is a candidate in its own right:

```text
Error: the value did not match any of the 4 members of the union; the closest member type is <42>, which failed as follows:
Error: expected <42> type but <number> type value `41` was passed.
```

Two deliberate exceptions:

- **`typeName` and the member listing keep the members as they were written.** Flattening those would discard a name the caller chose: `union([Status, nullType])` should still say `expected one of <Status>, <null>` rather than expanding `Status` into its literals. Only the member list used for validation, pruning and error reporting is flattened.
- **A `recursion` member is never expanded.** Flattening asks each member whether it is a union; the proxy a recursive type returns answers that from the properties it already has, without running its definition. A type defined in terms of itself therefore stays a single opaque member, and building the union does not force its definition.

---

Implementation: `src/compose/union.mts` · Tests: `src/compose/union-closest-member.test.mts`, `src/compose/union-nested-union.test.mts` · Message formats: `src/utils/validation-error.mts`
