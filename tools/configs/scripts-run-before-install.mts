/**
 * The scripts that run before `ts-data-forge` can be imported — under plain
 * `node`, from a workflow before `pnpm install`, from a Claude Code hook in a
 * clone that may have no `node_modules`, or before `ws:build` has built the
 * package. Each imports only `node:*` at runtime and uses only erasable syntax.
 *
 * The root `eslint.config.mts` turns every `ts-data-forge` lint rule off for
 * these, because each rule's fix writes an import of the package. Its test
 * holds the list to the root `tools/` scripts `check:root:node-run-scripts`
 * finds plain `node` running, less those it lets load packages, and fails a
 * line-level disable or an inline configuration of one of those rules, and one
 * that loads anything but `node:*`: a relative file it loaded would be linted
 * with those rules on.
 */
export const scriptsRunBeforeInstall = [
  'tools/scripts/cmd/assert-deps-built.mts',
  'tools/scripts/cmd/claude-code-claude-md-sync.mts',
  'tools/scripts/cmd/claude-code-post-edit.mts',
  'tools/scripts/cmd/firebase-deploy-plan.mts',
  'tools/scripts/cmd/mature-updates.mts',
  'tools/scripts/cmd/submit-chrome-extension.mts',
  'tools/scripts/cmd/workflow-steps.mts',
] as const;
