---
'github-settings-as-code': patch
---

`repo-settings apply` writes the applied values back to the file each ruleset or environment was declared in, so renaming one no longer leaves a second file holding the same id, and an environment whose name differs from GitHub's only in case keeps its file. A created ruleset's id is written back as soon as it is created, so a later failure no longer makes the next `apply` create it again. The ruleset list is read across every page and leaves out the organization's and enterprise's rulesets, for both `apply` and `backup`.
