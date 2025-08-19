[**eslint-config-typed**](../README.md)

---

[eslint-config-typed](../README.md) / rules/eslint-rules

# rules/eslint-rules

## Variables

### eslintRules

> `const` **eslintRules**: [`EslintRules`](../types/rules/eslint-rules.md#eslintrules)

Defined in: [src/rules/eslint-rules.mts:90](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/rules/eslint-rules.mts#L90)

#### Link

https://github.com/eslint/eslint/blob/main/conf/eslint-all.js

---

### restrictedGlobals

> `const` **restrictedGlobals**: readonly \[`"eval"`, `"Function"`, \{ `message`: `"use 'Number.Infinity' instead."`; `name`: `"Infinity"`; \}, \{ `message`: `"use 'Number.isFinite' instead."`; `name`: `"isFinite"`; \}, \{ `message`: `"use 'Number.isNaN' instead."`; `name`: `"isNaN"`; \}, \{ `message`: `"use 'Number.NaN'  instead."`; `name`: `"NaN"`; \}, \{ `message`: `"use 'Number.parseFloat' instead."`; `name`: `"parseFloat"`; \}, \{ `message`: `"use 'Number.parseInt' instead."`; `name`: `"parseInt"`; \}\]

Defined in: [src/rules/eslint-rules.mts:41](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/rules/eslint-rules.mts#L41)

---

### restrictedGlobalsForFrontend

> `const` **restrictedGlobalsForFrontend**: readonly \[`"eval"`, `"Function"`, \{ `message`: `"use 'Number.Infinity' instead."`; `name`: `"Infinity"`; \}, \{ `message`: `"use 'Number.isFinite' instead."`; `name`: `"isFinite"`; \}, \{ `message`: `"use 'Number.isNaN' instead."`; `name`: `"isNaN"`; \}, \{ `message`: `"use 'Number.NaN'  instead."`; `name`: `"NaN"`; \}, \{ `message`: `"use 'Number.parseFloat' instead."`; `name`: `"parseFloat"`; \}, \{ `message`: `"use 'Number.parseInt' instead."`; `name`: `"parseInt"`; \}, \{ `message`: `"use 'window.location' instead."`; `name`: `"location"`; \}, \{ `message`: `"use 'window.history' instead."`; `name`: `"history"`; \}, \{ `message`: `"use 'window.navigator' instead."`; `name`: `"navigator"`; \}\]

Defined in: [src/rules/eslint-rules.mts:70](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/rules/eslint-rules.mts#L70)

---

### restrictedSyntax

> `const` **restrictedSyntax**: `object`[]

Defined in: [src/rules/eslint-rules.mts:3](https://github.com/noshiro-pf/eslint-config-typed/blob/main/src/rules/eslint-rules.mts#L3)

#### Type declaration

##### message

> **message**: `string` = `'use "Object.hasOwn" instead.'`

##### selector

> **selector**: `string` = `"BinaryExpression[operator='in']"`
