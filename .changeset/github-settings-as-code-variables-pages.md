---
'github-settings-as-code': patch
---

Read every page of the repository's Actions variables. The list was read in one request, which GitHub answers ten to a page, so with more than ten variables `backup variables` dropped the rest from the declaration and `apply variables` sent `POST` for an existing variable and stopped on `409 Already exists`.
