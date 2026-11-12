// eslint-disable-next-line import-x/no-relative-packages
import { assertSharedExports } from '../../../tools/configs/eslint-rule-module-parity.mjs';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
import { SHARED_EXPORTS } from '../src/rules/constants.mjs';

/**
 * Fails the run when `SHARED_EXPORTS`, which the rules read, is not what
 * ts-data-forge re-exports from ts-std-forge, as both packages' published types
 * say. Once per run: reading the types takes seconds.
 */
const checkSharedExports = (): void => {
  assertSharedExports(SHARED_EXPORTS, {
    packageDir: workspaceRootPath,
    from: 'ts-data-forge',
    definedIn: 'ts-std-forge',
  });
};

export default checkSharedExports;
