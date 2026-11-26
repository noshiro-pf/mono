---
'github-settings-as-code': patch
---

Read what is there before `apply` writes, in full and from the right repository:

- An environment's deployment branch policies are read from every page, so `backup` declares, and `apply` deletes or keeps, the policies past the first 100.
- `apply variables` updates each declared variable and creates it only when the update answers `404`, so a variable the list missed is updated instead of stopping `apply` on `409 Already exists`.
- An empty `OWNER` or `REPO_NAME` is refused with an error naming it, before any request, instead of sending requests for an empty owner or repository name.
