---
'github-settings-as-code': major
---

`backup` writes the settings files themselves. The `bk/` mirror directories are
gone, and so is every read of them.

There used to be two copies of each resource: the declaration
(`repo-settings/<target>/…json`) and a mirror of GitHub under `bk/`. The mirror
was meant as a pre-apply safety copy, but nothing ever checked the two against
each other, and running `apply` after a while produced a diff in `bk/` that
carried no information. What the mirror was for is now done continuously by the
drift check, which compares GitHub against the files that are actually
declared.

Breaking changes for anyone calling this as a library:

- `backupRulesets`, `backupEnvironments`, `backupActionsSettings`,
  `backupPagesSettings`, `backupRepositorySettings`,
  `backupVulnerabilityAlerts` and `backupVariables` write
  `repo-settings/<target>/…json` instead of `repo-settings/<target>/bk/…json`.
  **`backup` now overwrites the declaration**, which is the point of it — it is
  how you pull the current state in — but it is no longer a read-only-ish
  operation on a throwaway directory.
- `readRulesetBackupFiles` and `readEnvironmentBackupFiles` are removed. There
  is nothing to read.
- `apply` no longer takes a snapshot before it sends anything. It could not:
  that snapshot now writes the declaration, so taking it would overwrite the
  very file `apply` is about to read.

The multi-file backups (`rulesets`, `environments`) no longer empty the
directory first. Emptying it would delete a resource that is declared but not
yet applied, and any `README.md` sitting beside the declarations. A file that
is declared with nothing live behind it is reported by the drift check, which
is where that belongs.

`applyRulesets` decides create-versus-update from the live rulesets rather than
from the old mirror, which is also more correct: the mirror was a copy taken
moments earlier, so a ruleset deleted in between would have been treated as
updatable.
