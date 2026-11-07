import dedent from 'dedent';
import {
  expectedFixFmtFull,
  findFormatScriptProblems,
  findPrettierInSource,
} from './check-format-scripts.mjs';

describe(expectedFixFmtFull, () => {
  test('climbs as many levels as the member is deep', () => {
    assert.strictEqual(
      expectedFixFmtFull('libs/a'),
      'tsx --tsconfig ../../tools/configs/tsconfig.tsx.json ../../tools/scripts/cmd/format-package.mts',
    );

    assert.strictEqual(
      expectedFixFmtFull('languages/sumi/cli'),
      'tsx --tsconfig ../../../tools/configs/tsconfig.tsx.json ../../../tools/scripts/cmd/format-package.mts',
    );
  });
});

describe(findFormatScriptProblems, () => {
  test('accepts the shared command, and a member without `fix:fmt:full`', () => {
    assert.deepStrictEqual(
      findFormatScriptProblems('libs/a', {
        'fix:fmt:full': expectedFixFmtFull('libs/a'),
        'gen:x': `tsx ./gen.mts && ${expectedFixFmtFull('libs/a')} 'src/*.mts'`,
        'fix:fmt': 'pnpm run z:format-uncommitted --cwd .',
      }),
      [],
    );

    assert.deepStrictEqual(
      findFormatScriptProblems('libs/a', { build: 'tsc' }),
      [],
    );
  });

  test('rejects a bare `prettier --write .` as `fix:fmt:full`', () => {
    assert.deepStrictEqual(
      findFormatScriptProblems('apps/b', {
        'fix:fmt:full': 'prettier --write .',
      }),
      [
        `\`fix:fmt:full\` must be \`${expectedFixFmtFull('apps/b')}\``,
        '`fix:fmt:full` runs Prettier directly',
      ],
    );
  });

  test('rejects a `fix:fmt:full` that reaches Prettier through another script', () => {
    assert.deepStrictEqual(
      findFormatScriptProblems('libs/a', {
        'fix:fmt:full': 'pnpm run z:prettier .',
        'z:prettier':
          'prettier --config ../../.prettierrc --ignore-path ../../.prettierignore --ignore-path ../../.gitignore --write',
      }),
      [
        `\`fix:fmt:full\` must be \`${expectedFixFmtFull('libs/a')}\``,
        '`z:prettier` runs Prettier directly',
      ],
    );
  });

  test('rejects the shared command climbing the wrong number of levels', () => {
    assert.deepStrictEqual(
      findFormatScriptProblems('languages/sumi/cli', {
        'fix:fmt:full': expectedFixFmtFull('libs/a'),
      }),
      [
        `\`fix:fmt:full\` must be \`${expectedFixFmtFull('languages/sumi/cli')}\``,
      ],
    );
  });

  test('rejects a generator running the shared command from the wrong depth', () => {
    assert.deepStrictEqual(
      findFormatScriptProblems('languages/sumi/cli', {
        'gen:schema': `tsx ./gen.mts && ${expectedFixFmtFull('apps/b')} ./a.json`,
        'gen:ok': `tsx ./gen.mts && ${expectedFixFmtFull('languages/sumi/cli')} ./a.json`,
      }),
      [
        `\`gen:schema\` must run \`format-package.mts\` as \`${expectedFixFmtFull('languages/sumi/cli')}\``,
      ],
    );
  });

  test('rejects Prettier run directly by any script, in any position', () => {
    assert.deepStrictEqual(
      findFormatScriptProblems('apps/b', {
        'gen:schema': 'tsx ./gen.mts && prettier --write ./public/a.json',
        'gen:y': 'pnpm exec prettier --check .',
        'gen:z': 'npx prettier@3 --write .',
      }),
      [
        '`gen:schema` runs Prettier directly',
        '`gen:y` runs Prettier directly',
        '`gen:z` runs Prettier directly',
      ],
    );
  });

  test('rejects Prettier run by path', () => {
    assert.deepStrictEqual(
      findFormatScriptProblems('apps/b', {
        a: './node_modules/.bin/prettier --write .',
        b: 'node ../../node_modules/prettier/bin/prettier.cjs --write .',
      }),
      ['`a` runs Prettier directly', '`b` runs Prettier directly'],
    );
  });

  test('does not mistake names that only contain "prettier" for Prettier', () => {
    assert.deepStrictEqual(
      findFormatScriptProblems('apps/b', {
        a: 'node ./prettier-plugin-x/build.mjs',
        b: 'cat ../../.prettierrc ../../.prettierignore',
        e: 'eslint --rule prettier/prettier:off .',
        f: 'pnpm add -D @prettier/plugin-xml',
        g: 'tsx ./scripts/prettier/run.mts',
        h: 'pnpm run prettier:check',
        c: 'tsx ./scripts/run-prettier.mts',
        d: 'pnpm run z:prettier-free',
      }),
      [],
    );
  });
});

describe(findPrettierInSource, () => {
  test('finds an import of Prettier, static or dynamic', () => {
    assert.deepStrictEqual(
      findPrettierInSource(
        'gen.mts',
        dedent`
          import { format } from 'prettier';
          const p = await import('prettier/standalone');
        `,
      ),
      [
        'gen.mts:1: imports `prettier`',
        'gen.mts:2: imports `prettier/standalone`',
      ],
    );
  });

  test('finds the command in a string or a template', () => {
    assert.deepStrictEqual(
      findPrettierInSource(
        'gen.mts',
        dedent`
          await $('pnpm exec prettier --write src');
          spawnSync('node', ['node_modules/prettier/bin/prettier.cjs', file]);
          await $(\`prettier --write \${file}\`);
        `,
      ),
      [
        'gen.mts:1: runs `prettier`',
        'gen.mts:2: runs `prettier`',
        'gen.mts:3: runs `prettier`',
      ],
    );
  });

  test('passes a comment, a plugin name and the shared helper', () => {
    assert.deepStrictEqual(
      findPrettierInSource(
        'gen.mts',
        dedent`
          // \`prettier --write\` on the generated file
          import { formatPackage } from '../../tools/configs/format-package.mjs';
          const plugins = ['prettier-plugin-organize-imports'];
          formatPackage({ cwd, patterns: [file] });
        `,
      ),
      [],
    );
  });
});
