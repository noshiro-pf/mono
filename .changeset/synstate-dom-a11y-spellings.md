---
'eslint-config-typed': patch
---

`synstate-dom-a11y/no-autofocus` reports synstate-dom's `autofocus`, the DOM
property's spelling, as `jsx-a11y/no-autofocus` reports React's `autoFocus`:
`<input autofocus />` was never reported. No other jsx-a11y rule compares a name
it has built in with React's spelling exactly.

`synstate-dom-a11y/prefer-tag-over-role` no longer reports an SVG element given
a role, such as `<g role={constant('button')}>` or
`<svg role={constant('img')}>`:
the HTML tag it asked for cannot stand inside an `<svg>`. An HTML element given
a role is reported as before.
