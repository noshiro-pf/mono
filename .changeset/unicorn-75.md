---
'eslint-config-typed': minor
---

Follow `eslint-plugin-unicorn` to v75 and `eslint-plugin-playwright` to v2.12.

New unicorn rules turned on: `no-async-iterator-callback`,
`no-unused-builtin-method-return` (which replaces the deprecated
`no-unused-array-method-return`), `no-unused-iterator-helper`,
`no-useless-set-construction`, `no-using-resource-escape`,
`prefer-iterator-zip` and `prefer-temporal-conversion`.

Turned off: `prefer-combined-guards` (it cannot merge guards that have a
comment between them), `prefer-json-import`, `prefer-uint8array-hex`
(`Uint8Array#toHex()` is not in every supported Node.js version), and the ten
rules that only support the `css/css` language.

New playwright rules turned on: `no-identical-title`,
`no-test-return-statement`, `prefer-ending-with-an-expect`,
`no-action-timeout`, `no-magic-timeouts` and `require-annotation-reason`.
Turned off: `no-export` (as in the jest rules) and
`no-template-literal-title`.
