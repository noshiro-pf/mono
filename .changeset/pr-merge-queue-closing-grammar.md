---
'pr-report-core': minor
'pr-merge-queue': minor
---

Add `closingKeywordBefore`, `CLOSING_ISSUE_NUMBER` and `asciiLowerCase`: GitHub's closing keywords as one grammar. `pr-report` and `pr-description` now read closing keywords in the text a Markdown parser says a description shows, so neither reads one in Markdown code, a code span or an HTML comment (an HTML `<code>` element is read, on the side of reading), nor one across two table cells or two HTML block elements, nor one before an escaped `\#`; a number ends where an element begins (`#12**3**` names #12). A body holding more than the parser reads in time is read without it, paragraph by paragraph, by an approximation of what it shows. `pr-report` also reads a keyword before `owner/repo#N` naming this repository or an `http://` issue URL, and none before `#0`; `pr-description` no longer takes U+017F LATIN SMALL LETTER LONG S or U+212A KELVIN SIGN for a letter of a keyword, and refuses `Fixes#2` and `**Fixes:** #2` as `pr-report` reads them.
