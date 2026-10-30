---
'eslint-config-typed': minor
---

Add `immer-coding-style/mut-prefixed-draft`, enabled in `eslintConfigForImmer`. It reports the draft parameter of a `produce` / `produceWithPatches` recipe whose name lacks the `mut_` prefix (a destructured draft and one that is never referenced are left alone), which `functional/immutable-data` otherwise reports on every line that writes to it without saying the fix is a rename. The autofix renames the parameter and its references (`(draft) => { draft.x = 1; }` → `(mut_draft) => { mut_draft.x = 1; }`), and is withheld when it could change the code's meaning or add shadowing: the new name is declared in or around the recipe or read in it, the recipe calls `eval`, an enclosing recipe's draft has the same name, the recipe declares the draft's name again, or it assigns to the draft itself.
