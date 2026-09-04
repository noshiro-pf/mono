---
'eslint-config-typed': minor
---

Turn `functional/readonly-type` off.

`ts-codemod-lib`'s `convertToReadonlyTransformer` performs the same normalization and more of it: the rule rewrites a type literal whose members are already `readonly` into `Readonly<{ ... }>`, while the transformer wraps the literal whether or not anything in it was readonly to begin with. Every type the transformer has touched is therefore in the form the rule wants before the rule runs — measured against the repository this config is developed in, the rule reports nothing at all across `libs/`, `apps/` and `tools/`, and it needs type information to say so.

Projects that do not run that transformer and want the `Readonly<T>` spelling enforced by ESLint can turn the rule back on:

```js
{
    rules: {
        'functional/readonly-type': ['error', 'generic'],
    },
}
```
