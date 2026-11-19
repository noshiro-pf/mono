---
'eslint-plugin-ts-restrictions': patch
---

`no-unnecessary-array-from` no longer fixes away the `Array.from()` copy before
a method that calls back once per element (`forEach`, `map`, `filter`, `find`,
`some`, `every`, `reduce`, …), returns an iterator (`values`, `keys`,
`entries`) or turns each element into a string (`join`, `toString`,
`toLocaleString`), nor before an argument that may have an effect: there the
copy can be a snapshot that code run meanwhile changes, such as a listener list
whose listeners remove themselves, and `--fix` made the loop skip elements.
Removing it is offered as a suggestion instead. The methods that read the array
before any such code runs (`toSorted`, `includes`, `at`, `slice`, …) are still
fixed, and the message no longer says that `forEach` returns a new array.
