/**
 * The scripts that run before `ts-data-forge` can be imported — under plain
 * `node`, from a workflow before `pnpm install`, from a Claude Code hook in a
 * clone that may have no `node_modules`, or before `ws:build` has built the
 * package. Each imports only `node:*` at runtime and uses only erasable syntax.
 *
 * The root `eslint.config.mts` turns every `ts-data-forge` lint rule off for
 * these, because each rule's fix writes an import of the package. Its test
 * holds the list to the scripts a manifest, workflow or hook runs under `node`,
 * fails one whose `import` / `export … from` statements load anything but
 * `node:*` (each script's own test checks that too), and fails a line-level
 * disable of one of those rules.
 */
export const scriptsRunBeforeInstall = [
  'tools/scripts/cmd/assert-deps-built.mts',
  'tools/scripts/cmd/claude-code-claude-md-sync.mts',
  'tools/scripts/cmd/claude-code-post-edit.mts',
  'tools/scripts/cmd/firebase-deploy-plan.mts',
  'tools/scripts/cmd/mature-updates.mts',
  'tools/scripts/cmd/workflow-steps.mts',
] as const;
