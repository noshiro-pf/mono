---
'github-settings-as-code': patch
---

Declare `ts-repo-utils` as a dependency. Fourteen shipped modules import it,
but it was only a devDependency, so `repo-settings` crashed as soon as it did
any work:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'ts-repo-utils'
  imported from .../github-settings-as-code/dist/github/resolve-target-repo.mjs
```

`--help` printed fine, which is why this went unnoticed.
