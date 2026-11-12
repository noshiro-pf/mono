// cspell:ignore vnext

import { Result } from 'ts-data-forge';
import {
  findUnproxiedScripts,
  judgeProxyScripts,
} from './check-proxy-scripts.mjs';

// The shape is spelled out here rather than imported from the check, so that a
// change to the check's shape fails these tests until it is meant.
const RUN =
  "NODE_USE_ENV_PROXY=1 NODE_OPTIONS='--disable-warning=UNDICI-EHPA' tsx --tsconfig ./tools/configs/tsconfig.tsx.json";

const OPTIONS = "NODE_OPTIONS='--disable-warning=UNDICI-EHPA'";

const TSX = 'tsx --tsconfig ./tools/configs/tsconfig.tsx.json';

const FILE = './libs/pr-merge-queue/src/cmd/x.mts';

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
      { checked: 5, offenders: [] },
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
      checked: 1,
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
      { checked: 3, offenders: ['b', 'a'] },
    );
  });

  test('does not hold a script without both pr-merge-queue and cmd', () => {
    assert.deepStrictEqual(
      findUnproxiedScripts({
        lib: `${TSX} ./libs/pr-merge-queue/src/pr-report/main.mts`,
        filter: 'pnpm run --filter=pr-merge-queue gen:plugin-version',
        other: `${TSX} ./tools/scripts/cmd/x.mts`,
      }),
      { checked: 0, offenders: [] },
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
      { checked: 1, offenders: ['s'] },
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
      checked: 1,
      offenders: ['s'],
    });
  });
});

describe(judgeProxyScripts, () => {
  test('passes with the number of scripts it checked', () => {
    assert.deepStrictEqual(
      judgeProxyScripts({ a: `${RUN} ${FILE}`, b: 'echo b' }),
      Result.ok(1),
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

  test('fails when it holds no script, as it then checks nothing', () => {
    const result = judgeProxyScripts({ a: 'echo a' });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'holds nothing');
  });
});
