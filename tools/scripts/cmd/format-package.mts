import { Arr } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { formatPackage } from '../../configs/format-package.mjs';

/**
 * Prettier over the workspace member in the working directory, with the root
 * ignore files: every member's `fix:fmt:full`, and `<this> <patterns>` in a
 * member script that formats what it generated. What it passes and why is
 * `tools/configs/format-package.mts`.
 */
if (isDirectlyExecuted(import.meta.url)) {
  process.exit(
    formatPackage({ cwd: process.cwd(), patterns: Arr.skip(process.argv, 2) }),
  );
}
