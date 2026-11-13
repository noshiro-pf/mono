import * as path from 'node:path';
import {
  pathFromRoot,
  projectRootPath,
  toPosixPath,
} from './project-root-path.mjs';

describe(toPosixPath, () => {
  test("joins a path's segments with `/`, whatever the platform's separator", () => {
    assert.strictEqual(
      toPosixPath(['a', 'b', 'c.mts'].join(path.sep)),
      'a/b/c.mts',
    );
  });
});

describe(pathFromRoot, () => {
  test('gives a file under the repository root relative to it, with `/` (#4031)', () => {
    assert.strictEqual(
      pathFromRoot(path.join(projectRootPath, 'tools', 'scripts', 'x.mts')),
      'tools/scripts/x.mts',
    );
  });

  test('takes another root', () => {
    assert.strictEqual(
      pathFromRoot(
        path.resolve('/r/libs/a/src/b.mts'),
        path.resolve('/r/libs/a'),
      ),
      'src/b.mts',
    );
  });
});
