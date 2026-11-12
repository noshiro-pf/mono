import { Result } from 'ts-data-forge';
import {
  checkRepository,
  findShellFindings,
  installPinnedShellcheck,
  unblockPrsCommands,
  type ScriptException,
  type ShellSources,
} from './check-shellcheck.mjs';

// The pinned shellcheck itself, as the guard runs it: what these tests assert
// is its verdict on a fixture, which a stand-in would only repeat.
const installed = await installPinnedShellcheck();

const findingsOf = async (
  sources: Partial<ShellSources>,
  exceptions: readonly ScriptException[] = [],
): Promise<readonly string[]> => {
  assert.isTrue(Result.isOk(installed));

  const result = await findShellFindings({
    shellcheck: installed.value.binary,
    sources: {
      shellFiles: [],
      manifests: [],
      unblockPrsConfig: undefined,
      ...sources,
    },
    exceptions,
  });

  assert.isTrue(Result.isOk(result));

  return result.value.findings;
};

const manifest = (path: string, script: string) =>
  ({
    path,
    text: JSON.stringify({ scripts: { clean: script, build: 'tsc -p .' } }),
  }) as const;

const unsafeRemoval = 'rm -rf "$out/"*';

describe(findShellFindings, () => {
  test('reports a finding in a shell file with its line', async () => {
    const findings = await findingsOf({
      shellFiles: [
        {
          path: 'scripts/clean.sh',
          text: '#!/bin/sh\ndir=$1\nrm -rf "$dir/"*\n',
        },
      ],
    });

    assert.lengthOf(findings, 1);

    assert.match(
      findings[0] ?? '',
      /^scripts\/clean\.sh:3:\d+: .*\[SC2115\]$/u,
    );
  });

  test('reads the dialect of a shell file from its shebang', async () => {
    const text = '[[ -n $1 ]] && echo ok\n';

    assert.deepStrictEqual(
      await findingsOf({
        shellFiles: [{ path: 'a.sh', text: `#!/bin/bash\n${text}` }],
      }),
      [],
    );

    const asSh = await findingsOf({
      shellFiles: [{ path: 'a.sh', text: `#!/bin/sh\n${text}` }],
    });

    assert.include(asSh.join('\n'), '[SC3010]');
  });

  test('reads a shell file whose name starts with a dash as a file', async () => {
    assert.deepStrictEqual(
      await findingsOf({
        shellFiles: [{ path: '-a.sh', text: '#!/bin/sh\necho "$1"\n' }],
      }),
      [],
    );
  });

  test("reports a manifest's script with the manifest's path and the script's name", async () => {
    const findings = await findingsOf({
      manifests: [manifest('libs/a/package.json', unsafeRemoval)],
    });

    assert.include(
      findings.map((finding) => finding.replace(/(SC\d+) .*$/u, '$1')),
      'libs/a/package.json: script "clean": SC2115',
    );

    assert.isTrue(findings.every((finding) => !finding.includes('"build"')));
  });

  test('names every manifest that has the same failing script', async () => {
    const findings = await findingsOf({
      manifests: [
        manifest('libs/a/package.json', unsafeRemoval),
        manifest('libs/b/package.json', unsafeRemoval),
      ],
    });

    for (const path of ['libs/a/package.json', 'libs/b/package.json']) {
      assert.isTrue(
        findings.some((finding) =>
          finding.startsWith(`${path}: script "clean": SC2115 `),
        ),
      );
    }
  });

  test('passes a clean manifest', async () => {
    assert.deepStrictEqual(
      await findingsOf({
        manifests: [manifest('libs/a/package.json', 'rimraf dist && tsc')],
      }),
      [],
    );
  });

  test('says which manifest is not JSON', async () => {
    assert.isTrue(Result.isOk(installed));

    const result = await findShellFindings({
      shellcheck: installed.value.binary,
      sources: {
        shellFiles: [],
        manifests: [{ path: 'libs/a/package.json', text: '{' }],
        unblockPrsConfig: undefined,
      },
      exceptions: [],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'libs/a/package.json');
  });

  test('reads a capture group of an unblock-prs command as the quoted word it becomes', async () => {
    assert.deepStrictEqual(
      await findingsOf({
        unblockPrsConfig: {
          path: '.github/unblock-prs.json',
          text: JSON.stringify({
            regenerate: {
              before: ['pnpm install --frozen-lockfile'],
              generators: [{ path: '^(x)$', run: 'pnpm --dir $1 run x' }],
            },
          }),
        },
      }),
      [],
    );
  });

  test('leaves `$1` as written in a field that takes no capture group', async () => {
    const findings = await findingsOf({
      unblockPrsConfig: {
        path: '.github/unblock-prs.json',
        text: JSON.stringify({ autoFix: { before: ['pnpm --dir $1 i'] } }),
      },
    });

    assert.isTrue(
      findings.some((finding) =>
        finding.startsWith(
          '.github/unblock-prs.json: autoFix.before[0]: SC2086 ',
        ),
      ),
    );
  });

  test('reports an unblock-prs command with its field path', async () => {
    const findings = await findingsOf({
      unblockPrsConfig: {
        path: '.github/unblock-prs.json',
        text: JSON.stringify({
          autoFix: {
            fixers: [
              { context: '^a$', run: 'pnpm run a', stage: 0 },
              { context: '^b$', run: 'rm -rf "$dir/"*', stage: 1 },
            ],
          },
        }),
      },
    });

    assert.isTrue(
      findings.some((finding) =>
        finding.startsWith(
          '.github/unblock-prs.json: autoFix.fixers[1].run: SC2115 ',
        ),
      ),
    );

    assert.isTrue(findings.every((finding) => !finding.includes('fixers[0]')));
  });

  test('leaves out a finding the table excepts, and only that one', async () => {
    const findings = await findingsOf(
      {
        manifests: [
          manifest('libs/a/package.json', unsafeRemoval),
          manifest('libs/b/package.json', unsafeRemoval),
        ],
      },
      [
        {
          manifest: 'libs/a/package.json',
          script: 'clean',
          code: 2115,
          reason: 'a fixture',
        },
      ],
    );

    assert.isTrue(
      findings.every(
        (finding) =>
          !finding.startsWith('libs/a/package.json: script "clean": SC2115'),
      ),
    );

    assert.isTrue(
      findings.some((finding) =>
        finding.startsWith('libs/b/package.json: script "clean": SC2115'),
      ),
    );
  });

  test('fails on a table entry that matches no finding', async () => {
    const findings = await findingsOf(
      { manifests: [manifest('libs/a/package.json', 'tsc')] },
      [
        {
          manifest: 'libs/a/package.json',
          script: 'clean',
          code: 2115,
          reason: 'a fixture',
        },
      ],
    );

    assert.lengthOf(findings, 1);

    assert.include(findings[0], 'matches no finding');

    assert.include(findings[0], 'libs/a/package.json');
  });
});

describe(unblockPrsCommands, () => {
  test('lists the command of every field it knows, by its path', () => {
    assert.deepStrictEqual(
      unblockPrsCommands({
        autoFix: {
          before: ['a'],
          prepare: [{ context: '^c$', run: 'b' }],
          fixers: [{ context: '^c$', run: 'c $1', stage: 0 }],
          after: ['d', 'e'],
        },
        regenerate: {
          before: ['f'],
          generators: [{ path: '^p$', run: 'g' }],
        },
        generatedBranches: [{ branch: 'x', rebuild: 'h <number>' }],
      }),
      Result.ok([
        { field: 'autoFix.before[0]', text: 'a' },
        { field: 'autoFix.prepare[0].run', text: 'b' },
        { field: 'autoFix.fixers[0].run', text: 'c $1' },
        { field: 'autoFix.after[0]', text: 'd' },
        { field: 'autoFix.after[1]', text: 'e' },
        { field: 'regenerate.before[0]', text: 'f' },
        { field: 'regenerate.generators[0].run', text: 'g' },
      ]),
    );
  });

  test('fails on a `run`, `before` or `after` where it knows of no command', () => {
    const result = unblockPrsCommands({
      speculate: { before: ['pnpm install'] },
      autoFix: { fixers: [{ context: '^c$', cleanup: { run: 'x' } }] },
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'speculate.before');

    assert.include(result.value, 'autoFix.fixers[0].cleanup.run');
  });
});

describe(checkRepository, () => {
  // Beside `check:root:shellcheck`, so that a change to the guard is tried on
  // the repository's own files. It runs shellcheck over every distinct script,
  // beside the other `check:root` scripts, so it gets more than five seconds.
  test('holds for the repository itself', { timeout: 60_000 }, async () => {
    const result = await checkRepository();

    // `assert.isTrue` takes no message in this repository's typings; the
    // comparison shows the messages when it fails.
    assert.deepStrictEqual(Result.isErr(result) ? result.value : '', '');
  });
});
