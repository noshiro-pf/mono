import { Result } from 'ts-data-forge';
import type { RegenerateConfig } from '../config/index.mjs';
import { describeConflict, planRegeneration } from './regenerate.mjs';

const CONFIG: RegenerateConfig = {
  before: [],
  generators: [
    { path: /^docs\/(\w+)\.md$/u, run: 'pnpm run doc:$1' },
    { path: /(?:^|\/)index\.mts$/u, run: 'pnpm run gen:index' },
  ],
} as const;

describe(planRegeneration, () => {
  test('runs each generator once, in the order declared', () => {
    assert.deepStrictEqual(
      planRegeneration(
        ['src/index.mts', 'docs/api.md', 'lib/index.mts'],
        CONFIG,
      ),
      Result.ok(["pnpm run doc:'api'", 'pnpm run gen:index']),
    );
  });

  test('gives the files no generator writes', () => {
    assert.deepStrictEqual(
      planRegeneration(['src/index.mts', 'src/a.mts'], CONFIG),
      Result.err(['src/a.mts']),
    );
  });
});

describe(describeConflict, () => {
  test('names the files, what changed them, and those that regenerate', () => {
    assert.strictEqual(
      describeConflict(
        ['src/index.mts', 'src/a.mts'],
        '',
        'main',
        ['src/index.mts'],
        [3, 4],
      ),
      'conflicts with main in `src/index.mts`, `src/a.mts` (changed there by #3, #4); only `src/index.mts` could be generated again',
    );
  });

  test('gives what git printed when it named no file', () => {
    assert.strictEqual(
      describeConflict([], 'fatal:\n  no  way', 'main', [], []),
      'the rebase onto main failed: fatal: no way',
    );
  });
});
