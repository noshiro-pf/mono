// cspell:ignore vnext

import { Result, hasKey } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  findNetworkFiles,
  findUnproxiedScripts as findUnproxiedScriptsWith,
  judgeProxyScripts as judgeProxyScriptsWith,
  scriptFiles,
} from './check-proxy-scripts.mjs';

// The shape is spelled out here rather than imported from the check, so that a
// change to the check's shape fails these tests until it is meant.
const RUN =
  "NODE_USE_ENV_PROXY=1 NODE_OPTIONS='--disable-warning=UNDICI-EHPA' tsx --tsconfig ./tools/configs/tsconfig.tsx.json";

const OPTIONS = "NODE_OPTIONS='--disable-warning=UNDICI-EHPA'";

const TSX = 'tsx --tsconfig ./tools/configs/tsconfig.tsx.json';

const FILE = './libs/pr-merge-queue/src/cmd/x.mts';

const NET = './tools/scripts/cmd/net.mts';

// As `scriptFiles` names it: from the root, without `./`.
const NETWORK_FILES: ReadonlySet<string> = new Set<string>([
  'tools/scripts/cmd/net.mts',
]);

// The queue cases below hold no file that reaches the network.
const findUnproxiedScripts = (
  scripts: ReadonlyRecord<string, string>,
): ReturnType<typeof findUnproxiedScriptsWith> =>
  findUnproxiedScriptsWith(scripts, new Set<string>());

const judgeProxyScripts = (
  scripts: ReadonlyRecord<string, string>,
): ReturnType<typeof judgeProxyScriptsWith> =>
  judgeProxyScriptsWith({ ...scripts, net: `${RUN} ${NET}` }, NETWORK_FILES);

describe(findUnproxiedScripts, () => {
  test('passes the shape, for each package and a command directory', () => {
    assert.deepStrictEqual(
      findUnproxiedScripts({
        a: `${RUN} ${FILE}`,
        b: `${RUN} ./libs/pr-merge-queue-v2/src/cmd/x.mts`,
        c: `${RUN} ./libs/pr-merge-queue-v10/src/cmd/x.mts`,
        d: `${RUN} ./libs/pr-merge-queue-next/src/cmd/x.mts`,
        e: `${RUN} ./libs/pr-merge-queue/src/cmd/x/main.mts`,
      }),
      { queue: 5, network: 0, held: 5, offenders: [] },
    );
  });

  // Each of these is reported. Most set the variable, or appear to, in a way a
  // reading of the shell would have to follow; the check follows none of them.
  test.each([
    ['without the variable', `${TSX} ${FILE}`],
    [
      'with the variable set to 0',
      `NODE_USE_ENV_PROXY=0 ${OPTIONS} ${TSX} ${FILE}`,
    ],
    ['with the variable inside another name', `X${RUN} ${FILE}`],
    [
      'with the value quoted',
      `NODE_USE_ENV_PROXY='1' ${OPTIONS} ${TSX} ${FILE}`,
    ],
    [
      'with the assignment quoted',
      `"NODE_USE_ENV_PROXY=1" ${OPTIONS} ${TSX} ${FILE}`,
    ],
    ['with the path quoted', `${RUN} '${FILE}'`],
    ['without NODE_OPTIONS', `NODE_USE_ENV_PROXY=1 ${TSX} ${FILE}`],
    [
      'with the variable after NODE_OPTIONS',
      `${OPTIONS} NODE_USE_ENV_PROXY=1 ${TSX} ${FILE}`,
    ],
    [
      'through node rather than tsx',
      `NODE_USE_ENV_PROXY=1 ${OPTIONS} node ${FILE}`,
    ],
    [
      'with the variable on an earlier command of a && chain',
      `${RUN} ./tools/x.mts && ${TSX} ${FILE}`,
    ],
    [
      'with the variable on an earlier command of a ; chain',
      `${RUN} ./tools/x.mts; ${TSX} ${FILE}`,
    ],
    ['with a command chained after the file', `${RUN} ${FILE} && rm -rf dist`],
    ['with arguments after the file', `${RUN} ${FILE} --format json`],
    [
      'exported by an earlier command',
      `export NODE_USE_ENV_PROXY=1; ${OPTIONS} ${TSX} ${FILE}`,
    ],
    ['under an env wrapper', `env -i ${RUN} ${FILE}`],
    [
      'under env setting the variable',
      `env NODE_USE_ENV_PROXY=1 ${OPTIONS} ${TSX} ${FILE}`,
    ],
    ['with the path in a variable', `f=${FILE}; ${RUN} "$f"`],
    [
      'with the variable from a shell variable',
      `NODE_USE_ENV_PROXY=$P ${OPTIONS} ${TSX} ${FILE}`,
    ],
    ['with leading whitespace', ` ${RUN} ${FILE}`],
    [
      'in a -next rebuild without the variable',
      `${TSX} ./libs/pr-merge-queue-next/src/cmd/x.mts`,
    ],
    [
      'in a -v10 rebuild without the variable',
      `${TSX} ./libs/pr-merge-queue-v10/src/cmd/x.mts`,
    ],
    [
      'running a copy from another directory',
      `${RUN} ./experimental/libs/pr-merge-queue/src/cmd/x.mts`,
    ],
    [
      'with a second file after the command file',
      `${RUN} ./libs/pr-merge-queue-plugin/src/cmd/x.mts ${FILE}`,
    ],
    [
      'in the shape for another package, naming this one in its file',
      `${RUN} ./libs/other/src/cmd/pr-merge-queue.mts`,
    ],
    [
      'with a redundant ./ in the path',
      `${RUN} ./libs/./pr-merge-queue/src/./cmd/x.mts`,
    ],
    [
      'with a doubled / in the path',
      `${RUN} ./libs//pr-merge-queue/src//cmd/x.mts`,
    ],
    [
      'after a cd into the package',
      `cd libs/pr-merge-queue && ${TSX} ./src/cmd/x.mts`,
    ],
    [
      'after a cd into the command directory',
      `cd libs/pr-merge-queue/src/cmd && ${TSX} x.mts`,
    ],
    [
      'with --dir on the command directory',
      'pnpm --dir libs/pr-merge-queue/src/cmd exec tsx x.mts',
    ],
    [
      'in a file under the command directory but not a command',
      `${RUN} ./libs/pr-merge-queue/src/cmd/x/y.mts`,
    ],
  ])('reports a script %s, by its name', (_, script) => {
    assert.deepStrictEqual(findUnproxiedScripts({ s: script }), {
      queue: 1,
      network: 0,
      held: 1,
      offenders: ['s'],
    });
  });

  test('reports every offender, in the order of the manifest', () => {
    assert.deepStrictEqual(
      findUnproxiedScripts({
        b: `${TSX} ${FILE}`,
        ok: `${RUN} ${FILE}`,
        a: `env ${RUN} ${FILE}`,
      }),
      { queue: 3, network: 0, held: 3, offenders: ['b', 'a'] },
    );
  });

  test('does not hold a script without both pr-merge-queue and cmd', () => {
    assert.deepStrictEqual(
      findUnproxiedScripts({
        lib: `${TSX} ./libs/pr-merge-queue/src/pr-report/main.mts`,
        filter: 'pnpm run --filter=pr-merge-queue gen:plugin-version',
        other: `${TSX} ./tools/scripts/cmd/x.mts`,
      }),
      { queue: 0, network: 0, held: 0, offenders: [] },
    );
  });

  // Holding too much is reported, never passed: only the package and its
  // rebuilds have a path in the shape.
  test.each([
    ['another package', 'pr-merge-queue-plugin'],
    ['a name ending in the package', 'x-pr-merge-queue'],
    ['-v without a number', 'pr-merge-queue-v'],
    ['-vnext', 'pr-merge-queue-vnext'],
    ['-next2', 'pr-merge-queue-next2'],
  ])('holds and reports the shape for %s', (_, name) => {
    assert.deepStrictEqual(
      findUnproxiedScripts({ s: `${RUN} ./libs/${name}/src/cmd/x.mts` }),
      { queue: 1, network: 0, held: 1, offenders: ['s'] },
    );
  });

  test.each([
    ['cmd inside a word', `${RUN} ./libs/pr-merge-queue/src/subcmd/x.mts`],
    ['cmds', `${RUN} ./libs/pr-merge-queue/src/cmds/x.mts`],
    ['another case', `${RUN} ./libs/PR-Merge-Queue/src/CMD/x.mts`],
    [
      'a short option glued to the name',
      'pnpm -Fpr-merge-queue exec tsx src/cmd/x.mts',
    ],
  ])('holds and reports a script with %s', (_, script) => {
    assert.deepStrictEqual(findUnproxiedScripts({ s: script }), {
      queue: 1,
      network: 0,
      held: 1,
      offenders: ['s'],
    });
  });
});

describe(judgeProxyScripts, () => {
  test('passes with the number of scripts it checked', () => {
    assert.deepStrictEqual(
      judgeProxyScripts({ a: `${RUN} ${FILE}`, b: 'echo b' }),
      Result.ok(2),
    );
  });

  test('names each offender and the shape to write', () => {
    const result = judgeProxyScripts({
      ok: `${RUN} ${FILE}`,
      bare: `${TSX} ${FILE}`,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'package.json: "bare"');

    assert.notInclude(result.value, '"ok"');

    assert.include(result.value, `${RUN} ./libs/pr-merge-queue/src/cmd/`);
  });

  test('fails when it holds no queue script, as it then checks nothing', () => {
    const result = judgeProxyScripts({ a: 'echo a' });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'pr-merge-queue command');

    assert.include(result.value, 'holds nothing');
  });

  test('fails when no script runs a file that reaches the network', () => {
    const result = judgeProxyScriptsWith(
      { a: `${RUN} ${FILE}` },
      new Set<string>(),
    );

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'reaches the network');

    assert.include(result.value, 'holds nothing');
  });

  test('names a script that runs a file reaching the network without the variable', () => {
    const result = judgeProxyScriptsWith(
      { a: `${RUN} ${FILE}`, net: `${RUN} ${NET}`, bare: `${TSX} ${NET}` },
      NETWORK_FILES,
    );

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'package.json: "bare"');

    assert.notInclude(result.value, '"net"');

    assert.include(result.value, 'NODE_USE_ENV_PROXY=1');
  });
});

describe('a script running a file that reaches the network', () => {
  test.each([
    ['through tsx', `${RUN} ${NET}`],
    ['through tsx, with arguments', `${RUN} ${NET} --report`],
    ['through node', `NODE_USE_ENV_PROXY=1 ${OPTIONS} node ${NET}`],
    [
      'through node, with arguments',
      `NODE_USE_ENV_PROXY=1 ${OPTIONS} node ${NET} a b`,
    ],
  ])('passes the shape %s', (_, script) => {
    assert.deepStrictEqual(
      findUnproxiedScriptsWith({ s: script }, NETWORK_FILES),
      { queue: 0, network: 1, held: 1, offenders: [] },
    );
  });

  test.each([
    ['without the variable', `${TSX} ${NET}`],
    ['through node without the variable', `node ${NET} actions`],
    ['without NODE_OPTIONS', `NODE_USE_ENV_PROXY=1 ${TSX} ${NET}`],
    [
      'with the variable set to 0',
      `NODE_USE_ENV_PROXY=0 ${OPTIONS} ${TSX} ${NET}`,
    ],
    ['under an env wrapper', `env ${RUN} ${NET}`],
    ['with leading whitespace', ` ${RUN} ${NET}`],
    ['with the path quoted', `${RUN} '${NET}'`],
    [
      'after a command without the variable',
      `${TSX} ./tools/x.mts && ${RUN} ${NET}`,
    ],
    [
      'with the variable on an earlier command',
      `${RUN} ./tools/x.mts && ${TSX} ${NET}`,
    ],
    ['with a command chained after it', `${RUN} ${NET} && echo done`],
    ['with a command piped after it', `${RUN} ${NET} | tee out`],
    ['with a command after a ;', `${RUN} ${NET}; echo done`],
    [
      'with a command substituted into its arguments',
      `${RUN} ${NET} $(echo x)`,
    ],
    [
      'through another runner',
      `NODE_USE_ENV_PROXY=1 ${OPTIONS} vite-node ${NET}`,
    ],
  ])('reports one %s', (_, script) => {
    assert.deepStrictEqual(
      findUnproxiedScriptsWith({ s: script }, NETWORK_FILES),
      { queue: 0, network: 1, held: 1, offenders: ['s'] },
    );
  });

  test('does not hold a script running only files that do not', () => {
    assert.deepStrictEqual(
      findUnproxiedScriptsWith(
        { s: `${TSX} ./tools/scripts/cmd/other.mts` },
        NETWORK_FILES,
      ),
      { queue: 0, network: 0, held: 0, offenders: [] },
    );
  });

  test('holds a script in the queue shape by both rules at once', () => {
    const queueFile = './libs/pr-merge-queue/src/cmd/net.mts';

    assert.deepStrictEqual(
      findUnproxiedScriptsWith(
        { ok: `${RUN} ${queueFile}`, bare: `${TSX} ${queueFile}` },
        new Set<string>([queueFile.slice(2)]),
      ),
      { queue: 2, network: 2, held: 2, offenders: ['bare'] },
    );
  });
});

describe(scriptFiles, () => {
  test('names each TypeScript file a script names, from the root', () => {
    assert.deepStrictEqual(
      scriptFiles(
        `node ./tools/scripts/cmd/a.mts --x && ${RUN} ./libs/p/src/cmd/b/main.mts y --config ./tools/configs/c.mts`,
      ),
      [
        'tools/scripts/cmd/a.mts',
        'libs/p/src/cmd/b/main.mts',
        'tools/configs/c.mts',
      ],
    );
  });

  test.each([
    ['quoted', `${RUN} './tools/scripts/cmd/a.mts'`],
    ['double-quoted', `${RUN} "./tools/scripts/cmd/a.mts"`],
    ['before a ;', `${RUN} ./tools/scripts/cmd/a.mts; x`],
    ['without ./', `${TSX} tools/scripts/cmd/a.mts`],
    ['under $PWD', `${TSX} $PWD/tools/scripts/cmd/a.mts`],
    ['under a quoted $PWD', `${TSX} "$PWD/tools/scripts/cmd/a.mts"`],
    ['under $PWD in its own quotes', `${TSX} "$PWD"/tools/scripts/cmd/a.mts`],
    ['with a redundant ./ inside', `${TSX} ./tools/./scripts/cmd/a.mts`],
  ])('names a file %s', (_, script) => {
    assert.deepStrictEqual(scriptFiles(script), ['tools/scripts/cmd/a.mts']);
  });

  test('names a file under a dot directory', () => {
    assert.deepStrictEqual(scriptFiles(`${TSX} ./.github/x.mts`), [
      '.github/x.mts',
    ]);
  });

  test.each([
    ['a glob', "oxlint './tools/{scripts,configs}/**/*.mts'"],
    ['a directory', 'oxlint tools/scripts tools/configs'],
    ['a file of another extension', `${TSX} ./tools/scripts/x.mts.bak`],
    ['a JavaScript file', 'node ./dist/x.mjs'],
    ["an option's value", 'x --out=./tools/generated.mts'],
    ['a file outside the repository', `${TSX} ../other/x.mts`],
    ['a path that leaves it', `${TSX} ./tools/../../x.mts`],
  ])('names nothing for %s', (_, script) => {
    assert.deepStrictEqual(scriptFiles(script), []);
  });
});

const find = (
  entries: readonly string[],
  files: ReadonlyRecord<string, string>,
): ReturnType<typeof findNetworkFiles> =>
  findNetworkFiles(entries, {
    readSource: (file) => (hasKey(files, file) ? files[file] : undefined),
    workspacePackages: new Map<string, string>([['net-lib', 'libs/net-lib']]),
  });

describe(findNetworkFiles, () => {
  test('finds a fetch call or an @octokit/ import, wherever the entry reaches it', () => {
    assert.deepStrictEqual(
      find(
        [
          'tools/direct.mts',
          'tools/indirect.mts',
          'tools/octokit.mts',
          'tools/dynamic.mts',
          'tools/workspace.mts',
          'tools/reexport.mts',
          'tools/lazy.mts',
          'tools/template.mts',
          'tools/require.mts',
          'tools/wrapped.mts',
          'tools/unscoped.mts',
          'tools/offline.mts',
        ],
        {
          'tools/direct.mts': 'await fetch(url);',
          'tools/indirect.mts':
            "import { x } from './lib/a.mjs';\nexport * from './b.mjs';",
          'tools/lib/a.mts': "import { y } from './c.mjs';",
          'tools/lib/c.mts': 'const r = await fetch(u);',
          'tools/b.mts': '',
          'tools/octokit.mts': "import { Octokit } from '@octokit/core';",
          'tools/dynamic.mts': "await import('./lib/c.mjs');",
          'tools/workspace.mts': "import { rest } from 'net-lib';",
          'libs/net-lib/src/entry-point.mts':
            'export const rest = () => fetch(u);',
          'tools/reexport.mts': "export { Octokit } from '@octokit/core';",
          'tools/lazy.mts':
            "const { Octokit } = await import('@octokit/rest');",
          'tools/template.mts':
            'const { Octokit } = await import(`@octokit/rest`);',
          'tools/require.mts': "import Octokit = require('@octokit/rest');",
          'tools/wrapped.mts': 'const r = (fetch as typeof fetch)(url);',
          'tools/unscoped.mts': "import { Octokit } from 'octokit';",
          'tools/offline.mts': [
            "import { z } from 'ts-data-forge';",
            "import './b.mjs';",
            "import type { Octokit } from '@octokit/core';",
            "export type { Octokit } from '@octokit/core';",
            "const name = '@octokit/core';",
            '// fetch(url) in a comment',
            "const s = 'fetch(url) in a string';",
            'git.fetch(origin);',
          ].join('\n'),
        },
      ),
      Result.ok(
        new Set<string>([
          'tools/direct.mts',
          'tools/indirect.mts',
          'tools/octokit.mts',
          'tools/dynamic.mts',
          'tools/workspace.mts',
          'tools/reexport.mts',
          'tools/lazy.mts',
          'tools/template.mts',
          'tools/require.mts',
          'tools/wrapped.mts',
          'tools/unscoped.mts',
        ]),
      ),
    );
  });

  test('ends on a cycle', () => {
    assert.deepStrictEqual(
      find(['tools/a.mts'], {
        'tools/a.mts': "import './b.mjs';",
        'tools/b.mts': "import './a.mjs';",
      }),
      Result.ok(new Set<string>()),
    );
  });

  test('fails on a module it cannot read, rather than passing it', () => {
    const result = find(['tools/a.mts'], {
      'tools/a.mts': "import './missing.mjs';",
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'tools/missing.mts');

    assert.include(result.value, 'a root script names tools/a.mts');
  });
});
