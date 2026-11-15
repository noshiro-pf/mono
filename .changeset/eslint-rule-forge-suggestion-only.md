---
'eslint-rule-forge': minor
---

Add `suggestionOnly`, which runs another plugin's rule unchanged and offers each fix it reports as a suggestion instead, for a rule whose `--fix` changes what code does; and `pluginRule` / `pluginRules`, which read one rule or every rule off a plugin module that ships no types. They were internal to eslint-config-typed, which now imports them from here.
