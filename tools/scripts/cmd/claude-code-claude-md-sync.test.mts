// cspell:ignore gpgsign

import dedent from 'dedent';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { ReadonlyRecord } from 'ts-type-forge';
import { runFile } from '../lib/child-process.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import {
  extractReferences,
  formatReport,
  parseNameStatus,
  run,
} from './claude-code-claude-md-sync.mjs';

const scriptPath = path.join(
  projectRootPath,
  'tools/scripts/cmd/claude-code-claude-md-sync.mts',
);

// The fixtures below live in temporary directories this file makes.

const write = (file: string, content: string): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
  fs.mkdirSync(path.dirname(file), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
  fs.writeFileSync(file, content);
};

const withTemporaryDirectory = async (
  body: (directory: string) => Promise<void> | void,
): Promise<void> => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-md-sync-'));

  try {
    await body(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

const gitIn = async (cwd: string, args: readonly string[]): Promise<string> => {
  const result = await runFile(
    'git',
    ['-c', 'commit.gpgsign=false', '-c', 'init.defaultBranch=main', ...args],
    {
      cwd,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'test',
        GIT_AUTHOR_EMAIL: 'test@example.com',
        GIT_COMMITTER_NAME: 'test',
        GIT_COMMITTER_EMAIL: 'test@example.com',
      },
    },
  );

  expect(result.status, result.stderr).toBe(0);

  return result.stdout.trim();
};

const commit = async (
  repo: string,
  files: ReadonlyRecord<string, string>,
): Promise<string> => {
  for (const [file, content] of Object.entries(files)) {
    write(path.join(repo, file), content);
  }

  await gitIn(repo, ['add', '--all']);

  await gitIn(repo, ['commit', '--quiet', '--message', 'change']);

  return gitIn(repo, ['rev-parse', 'HEAD']);
};

const CLAUDE_MD = dedent`
  # Rules

  See \`docs/a.md\` and [b](./docs/b.md#section).

  @docs/c.md
`;

/**
 * `upstream` stands for GitHub, `work` for the session's clone of it, both with
 * `main` at a `CLAUDE.md` naming `docs/a.md`, `docs/b.md` and `docs/c.md`.
 */
const withClone = async (
  body: (
    dirs: Readonly<{ upstream: string; work: string }>,
  ) => Promise<void> | void,
): Promise<void> => {
  await withTemporaryDirectory(async (dir) => {
    const upstream = path.join(dir, 'upstream');

    const work = path.join(dir, 'work');

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
    fs.mkdirSync(upstream);

    await gitIn(upstream, ['init', '--quiet']);

    await commit(upstream, {
      'CLAUDE.md': `${CLAUDE_MD}\n`,
      'docs/a.md': 'a\n',
      'docs/b.md': 'b\n',
      'docs/c.md': 'c\n',
      'docs/unnamed.md': 'u\n',
    });

    await gitIn(dir, ['clone', '--quiet', upstream, work]);

    await body({ upstream, work });
  });
};

/** Late enough that the once-a-minute fetch is always due. */
const later = (): number => Date.now() + 3_600_000;

const prompt = async (
  cwd: string,
  now: number = later(),
  sessionId: string = 'session-1',
): Promise<string | undefined> =>
  run(
    JSON.stringify({
      hook_event_name: 'UserPromptSubmit',
      session_id: sessionId,
      cwd,
    }),
    now,
  );

const sessionStart = async (cwd: string): Promise<void> => {
  assert.isUndefined(
    await run(
      JSON.stringify({
        hook_event_name: 'SessionStart',
        session_id: 'session-1',
        cwd,
      }),
      later(),
    ),
  );
};

describe('extractReferences', () => {
  test('reads backticks, links and @ imports', () => {
    assert.deepStrictEqual(
      Array.from(
        extractReferences(dedent`
          \`docs/a.md\`, \`<root>/tools/x.json\`, \`pnpm run check-changed\`
          [b](./docs/b.md#section) and @docs/c.md, not me@example.com
        `),
      ),
      ['docs/a.md', 'tools/x.json', 'docs/b.md', 'docs/c.md'],
    );
  });
});

describe('parseNameStatus', () => {
  test('reads one change per line', () => {
    assert.deepStrictEqual(parseNameStatus('M\tCLAUDE.md\nA\tdocs/a.md\n'), [
      { status: 'M', path: 'CLAUDE.md' },
      { status: 'A', path: 'docs/a.md' },
    ]);
  });
});

describe('formatReport', () => {
  test('cuts the whole report below 10,000 characters', () => {
    const report = formatReport({
      seen: 'a'.repeat(40),
      tip: 'b'.repeat(40),
      diff: 'x'.repeat(6000),
      referenced: Array.from({ length: 30 }, (_, i) => ({
        status: 'M',
        path: `${'d/'.repeat(60)}${i.toString()}.md`,
      })),
    });

    assert.isBelow(report.length, 10_000);

    assert.include(
      report,
      '[truncated; list the rest with `git diff --name-status',
    );
  });

  test('truncates a long diff and says how to read the rest', () => {
    const report = formatReport({
      seen: 'a'.repeat(40),
      tip: 'b'.repeat(40),
      diff: 'x'.repeat(20_000),
      referenced: [],
    });

    assert.isBelow(report.length, 10_000);

    assert.include(
      report,
      '`git diff aaaaaaaaaaaa..bbbbbbbbbbbb -- CLAUDE.md`',
    );
  });
});

describe('run', () => {
  test('is silent while origin/main has not moved', async () => {
    await withClone(async ({ work }) => {
      assert.isUndefined(await prompt(work));

      assert.isUndefined(await prompt(work));
    });
  });

  test('reports a CLAUDE.md change once, with its diff', async () => {
    await withClone(async ({ upstream, work }) => {
      assert.isUndefined(await prompt(work));

      await commit(upstream, { 'CLAUDE.md': `${CLAUDE_MD}\nA new rule.\n` });

      const report = await prompt(work);

      assert.isDefined(report);

      assert.include(report, 'CLAUDE.md changed as follows.');

      assert.include(report, '+A new rule.');

      assert.notInclude(report, 'Files CLAUDE.md names');

      assert.isUndefined(await prompt(work));
    });
  });

  test('names the referenced files that changed, and no others', async () => {
    await withClone(async ({ upstream, work }) => {
      assert.isUndefined(await prompt(work));

      await commit(upstream, {
        'docs/a.md': 'a2\n',
        'docs/b.md': 'b2\n',
        'docs/c.md': 'c2\n',
        'docs/unnamed.md': 'u2\n',
      });

      const report = await prompt(work);

      assert.isDefined(report);

      assert.notInclude(report, 'CLAUDE.md changed as follows.');

      assert.include(report, '  M docs/a.md\n  M docs/b.md\n  M docs/c.md');

      assert.notInclude(report, 'unnamed');
    });
  });

  test('says nothing when only files CLAUDE.md does not name changed', async () => {
    await withClone(async ({ upstream, work }) => {
      assert.isUndefined(await prompt(work));

      await commit(upstream, { 'docs/unnamed.md': 'u2\n' });

      assert.isUndefined(await prompt(work));
    });
  });

  test('reports from the merge base on a branch already behind', async () => {
    await withClone(async ({ upstream, work }) => {
      await commit(upstream, { 'CLAUDE.md': `${CLAUDE_MD}\nA new rule.\n` });

      assert.include(await prompt(work), '+A new rule.');
    });
  });

  test('keeps its baseline when HEAD moves during the session', async () => {
    await withClone(async ({ upstream, work }) => {
      assert.isUndefined(await prompt(work));

      await commit(upstream, { 'CLAUDE.md': `${CLAUDE_MD}\nA new rule.\n` });

      // The session pulls before the next prompt; the CLAUDE.md it loaded is
      // still the old one.
      await gitIn(work, ['pull', '--quiet', '--ff-only']);

      assert.include(await prompt(work), '+A new rule.');
    });
  });

  test('reads the root CLAUDE.md from a subdirectory', async () => {
    await withClone(async ({ upstream, work }) => {
      const docs = path.join(work, 'docs');

      assert.isUndefined(await prompt(docs));

      await commit(upstream, { 'CLAUDE.md': `${CLAUDE_MD}\nA new rule.\n` });

      assert.include(await prompt(docs), '+A new rule.');
    });
  });

  test('diffs a nested CLAUDE.md but not one under experimental/', async () => {
    await withClone(async ({ upstream, work }) => {
      assert.isUndefined(await prompt(work));

      await commit(upstream, {
        'libs/a/CLAUDE.md': 'A nested rule.\n',
        'experimental/old/CLAUDE.md': 'An old rule.\n',
      });

      const report = await prompt(work);

      assert.include(report, '+A nested rule.');

      assert.notInclude(report, 'An old rule.');
    });
  });

  test('lists at most 30 referenced files', async () => {
    await withClone(async ({ upstream, work }) => {
      const names = Array.from(
        { length: 32 },
        (_, i) => `docs/n${i.toString().padStart(2, '0')}.md`,
      );

      await commit(upstream, {
        'CLAUDE.md': `${names.map((name) => `\`${name}\``).join('\n')}\n`,
      });

      // The CLAUDE.md that names them, reported first.
      assert.include(await prompt(work), '+`docs/n31.md`');

      await commit(
        upstream,
        Object.fromEntries(names.map((name) => [name, 'changed\n'])),
      );

      const report = await prompt(work);

      assert.include(report, '  A docs/n29.md\n  … and 2 more');

      assert.notInclude(report, 'docs/n30.md');
    });
  });

  test('keeps the session where it was when git fails', async () => {
    await withClone(async ({ work }) => {
      const stateFile = path.join(work, '.git/claude-md-sync/session-1');

      // A commit this clone does not have, as after a failed `git diff`.
      const missing = 'f'.repeat(40);

      write(stateFile, `${missing}\n`);

      assert.isUndefined(await prompt(work));

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
      assert.strictEqual(fs.readFileSync(stateFile, 'utf8'), `${missing}\n`);
    });
  });

  test('SessionStart removes the state of sessions gone for 30 days', async () => {
    await withClone(async ({ work }) => {
      assert.isUndefined(await prompt(work, later(), 'session-2'));

      const stale = path.join(work, '.git/claude-md-sync/session-2');

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
      assert.isTrue(fs.existsSync(stale));

      assert.isUndefined(
        await run(
          JSON.stringify({
            hook_event_name: 'SessionStart',
            session_id: 'session-1',
            cwd: work,
          }),
          Date.now() + 31 * 24 * 60 * 60 * 1000,
        ),
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
      assert.isFalse(fs.existsSync(stale));
    });
  });

  test('reports again after SessionStart', async () => {
    await withClone(async ({ upstream, work }) => {
      assert.isUndefined(await prompt(work));

      await commit(upstream, { 'CLAUDE.md': `${CLAUDE_MD}\nA new rule.\n` });

      assert.include(await prompt(work), '+A new rule.');

      await sessionStart(work);

      assert.include(await prompt(work), '+A new rule.');
    });
  });

  test('fetches at most once a minute per clone', async () => {
    await withClone(async ({ upstream, work }) => {
      assert.isUndefined(await prompt(work));

      await commit(upstream, { 'CLAUDE.md': `${CLAUDE_MD}\nA new rule.\n` });

      // Another session of the same clone, within the minute.
      assert.isUndefined(await prompt(work, Date.now(), 'session-2'));

      assert.include(await prompt(work, later(), 'session-2'), '+A new rule.');
    });
  });

  test('keeps sessions apart', async () => {
    await withClone(async ({ upstream, work }) => {
      assert.isUndefined(await prompt(work));

      assert.isUndefined(await prompt(work, later(), 'session-2'));

      await commit(upstream, { 'CLAUDE.md': `${CLAUDE_MD}\nA new rule.\n` });

      assert.include(await prompt(work), '+A new rule.');

      assert.include(await prompt(work, later(), 'session-2'), '+A new rule.');
    });
  });

  test('is silent outside a git repository', async () => {
    await withTemporaryDirectory(async (dir) => {
      assert.isUndefined(await prompt(dir));
    });
  });

  test.each([
    ['not JSON', '{'],
    [
      'a session id that is not a file name',
      JSON.stringify({
        hook_event_name: 'UserPromptSubmit',
        session_id: '../x',
        cwd: projectRootPath,
      }),
    ],
  ])('is silent for %s', async (_, stdin) => {
    assert.isUndefined(await run(stdin));
  });
});

describe('the hook as Claude Code runs it', () => {
  test('prints the report as additionalContext', async () => {
    await withClone(async ({ upstream, work }) => {
      await commit(upstream, { 'CLAUDE.md': `${CLAUDE_MD}\nA new rule.\n` });

      const result = await runFile(process.execPath, [scriptPath], {
        input: JSON.stringify({
          hook_event_name: 'UserPromptSubmit',
          session_id: 'session-1',
          cwd: work,
        }),
      });

      expect(result.status, result.stderr).toBe(0);

      const output: unknown = JSON.parse(result.stdout);

      assert.nestedPropertyVal(
        output,
        'hookSpecificOutput.hookEventName',
        'UserPromptSubmit',
      );

      assert.nestedInclude(output, {
        'hookSpecificOutput.additionalContext': formatReport({
          seen: await gitIn(work, ['rev-parse', 'HEAD']),
          tip: await gitIn(work, ['rev-parse', 'origin/main']),
          diff: await gitIn(work, [
            'diff',
            'HEAD',
            'origin/main',
            '--',
            'CLAUDE.md',
          ]),
          referenced: [],
        }),
      });
    });
  });
});
