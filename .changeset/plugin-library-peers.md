---
'eslint-plugin-synstate': patch
'eslint-plugin-synstate-dom-a11y': patch
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-fortress': patch
'eslint-plugin-ts-std-forge': patch
'eslint-plugin-ts-type-forge': patch
---

Name the library each plugin is for as an optional peer dependency whose range
is the major its rules are written for: `synstate` `^9.0.0`, `synstate-dom`
`^0.13.0`, `ts-data-forge` `^15.0.0`, `ts-fortress` `^13.0.0`, `ts-std-forge`
`^0.6.0`, `ts-type-forge` `^9.0.0`. A project on another major is told at
install (pnpm warns; npm can refuse) that it wants the version of the plugin
released for that major.
