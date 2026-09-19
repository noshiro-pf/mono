---
'github-settings-as-code': minor
---

Repository variables are declared in `repo-settings/variables/settings.json`
instead of being written into the source of `applyVariables`, and `backup`
covers them like every other target.

The declaration is a record of name to value. `apply` validates it, refuses
every name GitHub would refuse before it sends the first one — alphanumerics
and `_`, no leading digit, no `GITHUB_` prefix — and then creates or updates
each declared variable. `backup` writes what is actually there to
`repo-settings/variables/bk/settings.json`, sorted by name and without the
timestamps, so the file changes only when a value does.

Two properties are deliberate and match the other targets. A variable that is
not declared is **not deleted**: what someone added in the web UI shows up in
`bk/`, which is how it gets noticed, rather than disappearing on the next
apply. And `apply` does not write the live values back into the declaration,
because the live set can be larger than the declared one and writing it back
would quietly adopt the difference.

Nothing secret belongs in this file — a repository variable is readable
through the API and in workflow logs. It is for values that are merely
configuration, such as the client id of a GitHub App whose private key is a
secret.
