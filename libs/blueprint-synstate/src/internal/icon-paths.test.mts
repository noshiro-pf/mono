import {
  getIconPaths,
  IconNames,
  IconSize,
  type IconName,
} from '@blueprintjs/icons';
import { ICON_PATHS_16, ICON_PATHS_20 } from './icon-paths.mjs';

// The paths `Icon` draws are copied from `@blueprintjs/icons`; the markup
// comparison with Blueprint reduces an icon to its name, so this is what
// catches one copied wrong, or one Blueprint has since redrawn.

describe.each([
  ['16px', ICON_PATHS_16, IconSize.STANDARD],
  ['20px', ICON_PATHS_20, IconSize.LARGE],
] as const)('the %s paths', (_, paths, size) => {
  test.each(Object.entries(paths))("%s is Blueprint's", (name, path) => {
    assertBlueprintIconName(name);

    assert.deepStrictEqual(getIconPaths(name, size), [path]);
  });
});

/** Fails, naming it, on a name `@blueprintjs/icons` does not have. */
function assertBlueprintIconName(name: string): asserts name is IconName {
  assert.include(Object.values<string>(IconNames), name);
}
