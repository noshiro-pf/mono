---
'ts-repo-utils': minor
---

Add a `dependencyFields` option to `runCmdInStagesAcrossWorkspaces` and
`getWorkspacePackages`, selecting which `package.json` fields the staging order
is derived from. It defaults to what it did before (`dependencies` +
`devDependencies` + `peerDependencies`), so existing callers are unaffected.

Pass `['dependencies', 'peerDependencies']` when development-only edges should
not constrain the order. In a repository whose toolchain is itself a workspace
package, those edges point back from the toolchain to the packages it serves
and leave the graph with no valid topological order.
