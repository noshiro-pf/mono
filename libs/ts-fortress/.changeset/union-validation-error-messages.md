---
'ts-fortress': minor
---

Make validation error messages more specific.

When a value fails to match a union whose member listing is long, the error no
longer lists every member. It now reports either the runtime type categories the
union accepts (when no member's category matches the value) or the closest
member — the one whose own validation produces the fewest errors — followed by
that member's errors, so a discriminated union value with a single wrong field
is explained by that field alone.

Values too long to print are now described (`a string of length 50`) instead of
being dropped, and for unions, enums and intersections the message states that
the value matched none / not all of the members. `null`, arrays, `Map`s and
`Set`s are named individually instead of the bare `object` that `typeof`
reports for all of them.

The closest member is the one with the lowest score, where a member scores the
number of checks it failed minus the number it passed (keys for a record,
elements for a tuple, one check otherwise). Counting errors alone would report a
small unrelated member over the large one the value nearly satisfies.

A union nested directly inside another union is now flattened into it, so
`A | (B | C)` behaves as `A | B | C` when a member has to be picked for the
error message. A `recursion` member answers the flattening check without
running its definition, so it stays a single opaque member.

When several members are equally close, they are all named and the first of
them reports its errors, unless naming them would exceed the same length bound
that governs the member listing.
