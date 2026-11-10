---
'github-settings-as-code': patch
---

`repo-settings apply` no longer fails in a repository without `repo-settings/rulesets/` or `repo-settings/environments/`: a target whose directory or file is absent is left untouched, as Pages and Dependabot alerts already were, and `apply all` goes on to the next target instead of stopping at a missing directory. The repository, Actions and variables targets skip a missing `settings.json` the same way.
