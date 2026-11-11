// cspell:ignore gpgsign

import { execFile } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as util from 'node:util';
import type { ReadonlyRecord } from 'ts-type-forge';
import { closingStdin } from '../lib/child-process.mjs';
import {
  BUILD_TOOL_PACKAGES,
  dependencyDirs,
  parseTargets,
  targetPathspecs,
  workspaceDependencies,
  workspacePackages,
  type WorkspacePackage,
} from './firebase-deploy-plan.mjs';

const scriptPath = fileURLToPath(
  new URL('firebase-deploy-plan.mts', import.meta.url),
);

describe('parseTargets', () => {
  test('reads each target, with missing lists as empty', () => {
    assert.deepStrictEqual(
      parseTargets(
        JSON.stringify([
          { only: 'firestore', paths: ['a/firestore.rules'] },
          { only: 'hosting', packages: ['apps/a'] },
        ]),
      ),
      {
        ok: true,
        value: [
          { only: 'firestore', packages: [], paths: ['a/firestore.rules'] },
          { only: 'hosting', packages: ['apps/a'], paths: [] },
        ],
      },
    );
  });

  test('refuses what would choose nothing or the wrong thing', () => {
    for (const json of [
      '',
      '[]',
      '{}',
      JSON.stringify([{ paths: ['a'] }]),
      JSON.stringify([{ only: 'hosting,functions', paths: ['a'] }]),
      JSON.stringify([{ only: 'hosting' }]),
      JSON.stringify([{ only: 'hosting', paths: 'a' }]),
      JSON.stringify([
        { only: 'hosting', paths: ['a'] },
        { only: 'hosting', paths: ['b'] },
      ]),
    ]) {
      assert.isFalse(parseTargets(json).ok);
    }
  });
});

describe('workspaceDependencies', () => {
  test('follows workspace: ranges outside devDependencies', () => {
    assert.deepStrictEqual(
      workspaceDependencies({
        dependencies: { lib: 'workspace:*', react: '^19.0.0' },
        peerDependencies: { peer: 'workspace:^' },
        optionalDependencies: { optional: 'workspace:~' },
        devDependencies: { 'eslint-config-typed': 'workspace:*' },
      }),
      ['lib', 'peer', 'optional'],
    );
  });

  test('a manifest without dependencies has none', () => {
    assert.deepStrictEqual(workspaceDependencies({ name: 'x' }), []);
  });
});

describe('dependencyDirs', () => {
  const packages: ReadonlyMap<string, WorkspacePackage> = new Map<
    string,
    WorkspacePackage
  >([
    ['app', { dir: 'apps/app', dependencies: ['shared', 'lib-a'] }],
    ['shared', { dir: 'apps/shared', dependencies: ['lib-a'] }],
    ['lib-a', { dir: 'libs/a', dependencies: ['lib-b'] }],
    ['lib-b', { dir: 'libs/b', dependencies: [] }],
    ['other', { dir: 'libs/other', dependencies: [] }],
  ]);

  test('is the roots and everything they reach, once each, sorted', () => {
    assert.deepStrictEqual(dependencyDirs(['apps/app'], packages), {
      ok: true,
      value: ['apps/app', 'apps/shared', 'libs/a', 'libs/b'],
    });
  });

  test('refuses a root that is no package, and a dependency that is none', () => {
    assert.isFalse(dependencyDirs(['apps/nope'], packages).ok);

    assert.isFalse(
      dependencyDirs(
        ['apps/app'],
        new Map<string, WorkspacePackage>([
          ['app', { dir: 'apps/app', dependencies: ['gone'] }],
        ]),
      ).ok,
    );
  });
});

describe('targetPathspecs', () => {
  const packages: ReadonlyMap<string, WorkspacePackage> = new Map<
    string,
    WorkspacePackage
  >([
    ['app', { dir: 'apps/app', dependencies: ['lib'] }],
    ['lib', { dir: 'libs/lib', dependencies: [] }],
    ['tool', { dir: 'libs/tool', dependencies: [] }],
  ]);

  test('paths alone are diffed as they are', () => {
    assert.deepStrictEqual(
      targetPathspecs(
        {
          only: 'firestore',
          packages: [],
          paths: ['apps/app/firestore.rules'],
        },
        packages,
        ['libs/tool'],
      ),
      { ok: true, value: ['apps/app/firestore.rules'] },
    );
  });

  test('packages bring their closure, the root build files and the exclusions', () => {
    const result = targetPathspecs(
      { only: 'hosting', packages: ['apps/app'], paths: ['apps/app/.x'] },
      packages,
      ['libs/tool'],
    );

    assert.isTrue(result.ok);

    assert.includeMembers(Array.from(result.value), [
      'apps/app/.x',
      'apps/app/',
      'libs/lib/',
      'libs/tool/',
      'pnpm-lock.yaml',
      ':(exclude,glob)**/*.md',
    ]);
  });
});

describe('workspacePackages', () => {
  test('reads the packages the root workspaces globs match', () => {
    const root = makeTree({
      'package.json': JSON.stringify({ workspaces: ['apps/*', 'libs/v*'] }),
      'apps/a/package.json': JSON.stringify({
        name: 'a',
        dependencies: { b: 'workspace:*' },
      }),
      'apps/no-manifest/README.md': '',
      'libs/v1/package.json': JSON.stringify({ name: 'b' }),
      'libs/other/package.json': JSON.stringify({ name: 'not-matched' }),
    });

    assert.deepStrictEqual(
      workspacePackages(root),
      new Map<string, WorkspacePackage>([
        ['a', { dir: 'apps/a', dependencies: ['b'] }],
        ['b', { dir: 'libs/v1', dependencies: [] }],
      ]),
    );
  });

  test('reads this repository, where both apps of event-schedule-app are', () => {
    const packages = workspacePackages(
      fileURLToPath(new URL('../../..', import.meta.url)),
    );

    assert.strictEqual(
      packages.get('event-schedule-app')?.dir,
      'apps/event-schedule-app',
    );

    assert.include(
      Array.from(packages.get('event-schedule-app')?.dependencies ?? []),
      'event-schedule-app-shared',
    );

    assert.strictEqual(
      packages.get('event-schedule-app-functions')?.dir,
      'apps/event-schedule-app-functions',
    );

    const dirs = new Set(Array.from(packages.values(), ({ dir }) => dir));

    for (const dir of BUILD_TOOL_PACKAGES) {
      assert.isTrue(dirs.has(dir));
    }
  });
});

describe('the script', () => {
  const targets = JSON.stringify([
    { only: 'firestore', paths: ['apps/app/firestore.rules'] },
    { only: 'hosting', packages: ['apps/app'] },
    { only: 'functions', packages: ['apps/fn'] },
  ]);

  const files: ReadonlyRecord<string, string> = {
    'package.json': JSON.stringify({ workspaces: ['apps/*', 'libs/*'] }),
    'pnpm-lock.yaml': 'a',
    'apps/app/package.json': JSON.stringify({
      name: 'app',
      dependencies: { lib: 'workspace:*' },
      devDependencies: { lint: 'workspace:*' },
    }),
    'apps/app/src/index.mts': 'a',
    'apps/app/README.md': 'a',
    'apps/app/firestore.rules': 'a',
    'apps/fn/package.json': JSON.stringify({ name: 'fn' }),
    'apps/fn/src/index.mts': 'a',
    'libs/lib/package.json': JSON.stringify({ name: 'lib' }),
    'libs/lib/src/index.mts': 'a',
    'libs/lib/src/index.test.mts': 'a',
    'libs/lint/package.json': JSON.stringify({ name: 'lint' }),
    'libs/lint/src/index.mts': 'a',
    'libs/ts-repo-utils/package.json': JSON.stringify({
      name: 'ts-repo-utils',
    }),
    'libs/ts-repo-utils/src/index.mts': 'a',
  } as const;

  /** The `only` the script writes after `change` is committed onto `files`. */
  const onlyAfter = async (
    change: ReadonlyRecord<string, string>,
  ): Promise<string | undefined> => {
    const repo = makeTree(files);

    await git(repo, ['init', '-q']);

    await commitAll(repo);

    const { stdout } = await closingStdin(
      execFileAsync('git', ['rev-parse', 'HEAD'], {
        cwd: repo,
        encoding: 'utf8',
      }),
    );

    const base = stdout.trim();

    writeFiles(repo, change);

    await commitAll(repo);

    return runScript(repo, { TARGETS: targets, BASE: base, HEAD: 'HEAD' });
  };

  test('chooses the targets whose files or dependencies changed', async () => {
    assert.strictEqual(
      await onlyAfter({ 'apps/app/firestore.rules': 'b' }),
      'firestore,hosting',
    );

    assert.strictEqual(
      await onlyAfter({ 'libs/lib/src/index.mts': 'b' }),
      'hosting',
    );

    assert.strictEqual(
      await onlyAfter({ 'apps/fn/src/index.mts': 'b' }),
      'functions',
    );

    assert.strictEqual(
      await onlyAfter({ 'pnpm-lock.yaml': 'b' }),
      'hosting,functions',
    );

    // The strip pass every library's build runs.
    assert.strictEqual(
      await onlyAfter({ 'libs/ts-repo-utils/src/index.mts': 'b' }),
      'hosting,functions',
    );
  });

  test('leaves out what no build reads', async () => {
    assert.strictEqual(await onlyAfter({ 'apps/app/README.md': 'b' }), '');

    assert.strictEqual(
      await onlyAfter({ 'libs/lib/src/index.test.mts': 'b' }),
      '',
    );

    assert.strictEqual(await onlyAfter({ 'libs/lint/src/index.mts': 'b' }), '');
  });

  test('chooses every target when nothing is deployed yet', async () => {
    const repo = makeTree(files);

    await git(repo, ['init', '-q']);

    await commitAll(repo);

    assert.strictEqual(
      await runScript(repo, { TARGETS: targets, BASE: '', HEAD: 'HEAD' }),
      'firestore,hosting,functions',
    );
  });

  test('gives each chosen target the pathspecs it was chosen by', async () => {
    const repo = makeTree(files);

    await git(repo, ['init', '-q']);

    await commitAll(repo);

    const { written } = await runScriptWithCode(repo, {
      TARGETS: targets,
      BASE: '',
      HEAD: 'HEAD',
    });

    const pathspecs = /^pathspecs=(?<json>.*)$/mu.exec(written)?.groups?.[
      'json'
    ];

    assert.isDefined(pathspecs);

    assert.include(pathspecs, '"firestore":["apps/app/firestore.rules"]');

    assert.include(pathspecs, '"libs/lib/"');

    assert.notInclude(pathspecs, 'libs/lint/');
  });

  test('fails, rather than choosing nothing, when git cannot diff', async () => {
    const repo = makeTree(files);

    await git(repo, ['init', '-q']);

    await commitAll(repo);

    const result = await runScriptWithCode(repo, {
      TARGETS: targets,
      BASE: '0000000000000000000000000000000000000000',
      HEAD: 'HEAD',
    });

    assert.strictEqual(result.code, 1);

    assert.strictEqual(result.only, undefined);
  });

  test('the script uses nothing the minimum Node lacks', () => {
    // That it loads nothing but builtins is `check:root:node-run-scripts`'s.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const source = fs.readFileSync(scriptPath, 'utf8');

    assert.notMatch(source, /\bTemporal\./u);
  });
});

const writeFiles = (
  root: string,
  files: ReadonlyRecord<string, string>,
): void => {
  for (const [file, content] of Object.entries(files)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(path.join(root, file), content);
  }
};

const makeTree = (files: ReadonlyRecord<string, string>): string => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'firebase-deploy-plan-'));

  writeFiles(root, files);

  return root;
};

const execFileAsync = util.promisify(execFile);

const git = async (repo: string, args: readonly string[]): Promise<void> => {
  await closingStdin(
    execFileAsync('git', args, {
      cwd: repo,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'test',
        GIT_AUTHOR_EMAIL: 'test@example.com',
        GIT_COMMITTER_NAME: 'test',
        GIT_COMMITTER_EMAIL: 'test@example.com',
      },
    }),
  );
};

const commitAll = async (repo: string): Promise<void> => {
  await git(repo, ['add', '.']);

  await git(repo, [
    '-c',
    'core.hooksPath=/dev/null',
    '-c',
    'commit.gpgsign=false',
    'commit',
    '-q',
    '-m',
    'commit',
  ]);
};

const runScriptWithCode = async (
  cwd: string,
  env: ReadonlyRecord<string, string>,
): Promise<
  Readonly<{ code: number; only: string | undefined; written: string }>
> => {
  const output = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'firebase-deploy-plan-output-')),
    'output',
  );

  const code = await new Promise<number>((resolve) => {
    execFile(
      process.execPath,
      [scriptPath],
      { cwd, env: { ...process.env, ...env, GITHUB_OUTPUT: output } },
      (error) => {
        resolve(
          error === null ? 0 : typeof error.code === 'number' ? error.code : 1,
        );
      },
    );
  });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const written = fs.existsSync(output) ? fs.readFileSync(output, 'utf8') : '';

  const only = /^only=(?<only>.*)$/mu.exec(written)?.groups?.['only'];

  return { code, only, written };
};

const runScript = async (
  cwd: string,
  env: ReadonlyRecord<string, string>,
): Promise<string | undefined> => {
  const { code, only } = await runScriptWithCode(cwd, env);

  assert.strictEqual(code, 0);

  return only;
};
