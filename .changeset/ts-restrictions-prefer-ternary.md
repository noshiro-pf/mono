---
'eslint-config-typed': minor
---

Add `ts-restrictions/prefer-ternary`, which reports everything
`unicorn/prefer-ternary` does and also folds a whole chain of them:
consecutive `if`s that return, `else if` branches, and a fallback that is
already a ternary become one `return a ? 1 : b ? 2 : 3;`. unicorn folds one
`if` at a time and refuses a branch that returns a ternary, so it left every
chain folded at its last link only.

A chain only this rule would fold is left alone when a comment sits inside it,
since the fix has nowhere to put the comment; the part below the last comment
is still folded. Under `only-single-line`, a fallback ternary is measured
branch by branch, so one Prettier has wrapped over several lines still folds.

The configuration turns `unicorn/prefer-ternary` off and turns
`ts-restrictions/prefer-ternary` on with the same `only-single-line` option.
