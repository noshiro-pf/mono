---
'github-settings-as-code': patch
---

`repo-settings --help` exits 0. It printed the help and then exited 1, because
the exit code was chosen by whether a command was given rather than by whether
help was asked for. Running it with no arguments at all still exits 1, which is
the usage error it was meant to report.
