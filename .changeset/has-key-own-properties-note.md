---
'ts-std-forge': patch
---

`hasKey`'s documentation now says that it sees own properties only, so an accessor declared in a class — which lives on the prototype — is not found, and that `Reflect.get` reads one through the prototype chain.
