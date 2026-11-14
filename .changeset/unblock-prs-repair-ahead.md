---
'pr-merge-queue': minor
---

`unblock-prs` with `speculate` repairs the candidates behind the first layer while it waits for that layer's checks, rather than once each is first. A candidate whose commits stopped the stack by conflicting is rebased onto the default branch when it conflicts with it — resolved by `regenerate` when only generated files conflict, otherwise set aside `rebase-failed` for the skill at once — and waits as before when it conflicts only with the layers below or still carries a merged layer's commits. A red layer above the first whose failures are all fixers' diffs has those fixers run on its pull request's head and the result pushed, once per head and never on a head a fix pushed; `autoFix` takes the commit whose check runs it reads as a new last argument, and `restackBehind` an `only` set.
