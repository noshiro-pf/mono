// cspell:ignore doas nohup myext XDELETE unstub fbody pushd popd Xpatch

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Arr, isRecord } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { runFile } from '../lib/child-process.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import {
  findPrivatePointer,
  isPublishingCommand,
} from './claude-code-public-write-gate.mjs';

const scriptPath = path.join(
  projectRootPath,
  'tools/scripts/cmd/claude-code-public-write-gate.mts',
);

// Built from parts, so that this file's own diff carries no pointer for the
// hook to refuse when it is pushed.
const PRIVATE_REPO = ['noshiro-pf', 'mono-security'].join('/');

type HookEvent = ReadonlyRecord<string, unknown>;

type Verdict = Readonly<{ denied: boolean; reason: string }>;

/**
 * The temporary directory the hook keeps its ledger in: beside the fixture, not
 * in it, so that the ledger is no untracked file of the fixture's repository.
 */
const ledger = (tmp: string): string => `${tmp}-ledger` as const;

/**
 * Runs the hook as Claude Code does: `node`, the event on stdin, with its
 * ledger beside `tmp` rather than in the machine's temporary directory.
 */
const runHook = async (tmp: string, event: HookEvent): Promise<Verdict> => {
  const result = await runFile(process.execPath, [scriptPath], {
    input: JSON.stringify({
      session_id: 'session-1',
      hook_event_name: 'PreToolUse',
      cwd: tmp,
      ...event,
    }),
    env: {
      ...process.env,
      TMPDIR: ledger(tmp),
      TEMP: ledger(tmp),
      TMP: ledger(tmp),
      // The fixture is the project whose working tree may be read; this process
      // may have inherited a session's own.
      CLAUDE_PROJECT_DIR: tmp,
    },
  });

  expect(result.status).toBe(0);

  if (result.stdout.trim() === '') {
    return { denied: false, reason: '' };
  }

  const output: unknown = JSON.parse(result.stdout);

  const decision =
    isRecord(output) && isRecord(output['hookSpecificOutput'])
      ? output['hookSpecificOutput']
      : ({} as const);

  return {
    denied: decision['permissionDecision'] === 'deny',
    reason:
      typeof decision['permissionDecisionReason'] === 'string'
        ? decision['permissionDecisionReason']
        : '',
  };
};

const isDenied = async (tmp: string, event: HookEvent): Promise<boolean> => {
  const verdict = await runHook(tmp, event);

  return verdict.denied;
};

const reasonOf = async (tmp: string, event: HookEvent): Promise<string> => {
  const verdict = await runHook(tmp, event);

  return verdict.reason;
};

const comment = (body: string, repo = 'mono'): HookEvent =>
  ({
    tool_name: 'mcp__github__add_issue_comment',
    tool_input: { owner: 'noshiro-pf', repo, issue_number: 1, body },
  }) as const;

const bash = (command: string): HookEvent =>
  ({
    tool_name: 'Bash',
    tool_input: { command },
  }) as const;

const write = (file: string, content: string): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
  fs.mkdirSync(path.dirname(file), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
  fs.writeFileSync(file, content);
};

const withTemporaryDirectory = async (
  run: (directory: string) => Promise<void>,
): Promise<void> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
  const dir = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'public-write-gate-')),
  );

  try {
    await run(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });

    fs.rmSync(ledger(dir), { recursive: true, force: true });
  }
};

const git = async (cwd: string, args: readonly string[]): Promise<void> => {
  const result = await runFile('git', args, {
    cwd,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'a',
      GIT_AUTHOR_EMAIL: 'a@example.com',
      GIT_COMMITTER_NAME: 'a',
      GIT_COMMITTER_EMAIL: 'a@example.com',
    },
  });

  expect(result.status).toBe(0);
};

describe('isPublishingCommand', () => {
  test.each([
    'wget --post-data=x https://api.github.com/repos/a/b/issues',
    'http POST api.github.com/repos/a/b/issues body=x',
    "node -e \"fetch('https://api.github.com/x', { method: 'POST' })\"",
    'gh label list && gh issue develop 3',
    'http post api.github.com/repos/a/b/issues title=x',
    'http api.github.com/repos/a/b/issues title=x',
    "node -e \"fetch('https://api.github.com/x', { method: 'post' })\"",
    'gh api -XDELETE repos/a/b/git/refs/heads/x',
    'gh label list && gh workflow run x.yml -f msg=y',
    'gh label list && gh secret set X --body y',
    'gh issue list && gh project item-edit --text y',
    'gh issue list && gh project copy 1 --title x',
    'gh pr list && gh pr revert 3 --body x',
    'gh label list && gh label clone a/b',
    'xh api.github.com/repos/a/b/issues title=x',
    'python -m httpie api.github.com/repos/a/b/issues title=x',
    'gh api repos/a/b/issues \\\n  -f title=x',
    "gh api repos/a/b/issues/1/comments --jq '.x | .y' -f body=x",
    "gh api 'repos/a/b/issues?state=open&per_page=1' -f title=x",
    'gh workflow run deploy.yml -f mode=list',
    'gh variable set MODE --body list',
    'gh pr revert 3 --body "revert the status change"',
    'gh project copy 1 --title "status board"',
    'curl -d @q.json -H "Authorization: bearer $GITHUB_TOKEN" "$GQL"',
    'curl -d @b.json https://github.example.com/api/v3/repos/a/b/issues',
    'curl -d @b.json https://github.example.com/api/graphql',
    'curl -sS -H "Authorization: bearer $GH_ENTERPRISE_TOKEN" -d @b.json https://ghe.corp/api/graphql',
    'curl -d @b.json -H "Authorization: bearer $(gh auth token)" "$URL"',
    'gh repo archive me/api --yes',
    'gh repo deploy-key add k.pub --title "read-only status"',
    'gh run rerun 3 --repo me/list',
    'curl -X POST -d @q.json "$GITHUB_API_URL/graphql"',
    'curl -d @q.json "$GITHUB_GRAPHQL_URL"',
    'curl -d @b.json -H "Authorization: token $GITHUB_PAT" "$URL"',
    "node -e \"fetch(process.env.GITHUB_API_URL + '/graphql', { method: 'POST' })\"",
    "echo 'pr merge 3 --squash' | xargs gh",
    '/usr/local/bin/gh pr create --fill',
    'gh pr merge 3 --squash && df -h',
    'curl -X POST -H "Authorization: token $INPUT_GH_TOKEN" "$URL"',
    './gh pr create --fill',
    '~/tools/gh pr merge 3',
    'echo "pr merge 3" | parallel gh',
    'echo "pr merge 3" | parallel -v gh',
    'GH_TOKEN=x gh pr create --fill',
    'timeout 60 gh pr merge 3',
    'sudo -E gh issue comment 3 --body x',
    'if true; then gh pr merge 3; fi',
    'sudo -u bot gh pr merge 3',
    'timeout 60s gh pr merge 3',
    'timeout -s KILL 60 gh pr merge 3',
    'xargs -P 4 -I % gh pr merge %',
    'env -i PATH="$PATH" gh pr merge 3',
    'if gh pr merge 3; then echo ok; fi',
    'bash -c "gh pr merge 3"',
    "sh -c 'gh issue comment 3 --body x'",
    'eval gh pr merge 3',
    'ssh host gh pr merge 3',
    'gh --repo owner/repo \\\n  pr merge 3',
    'GH_TOKEN="$TOKEN" gh pr merge 3',
    'gh --repo "$(cat repo.txt)" pr merge 3',
    '"$(which gh)" pr merge 3',
    'gh -R "$(gh repo view --json nameWithOwner -q .nameWithOwner)" pr merge 3',
    'gh -R "$(git config --get x.repo)" pr merge 3',
    'gh $(cat args.txt)',
    'bash -c "gh $CMD"',
    'GH_TOKEN=x gh $(cat args.txt)',
    'sudo -u bot gh $(cat args.txt)',
    'out=$(gh $ARGS)',
    'ssh host gh $(cat args.txt)',
    'timeout 60s gh $(cat args.txt)',
    'sudo -u bot gh co 3',
    "bash -c 'gh myext publish'",
    'gh myext publish --label status',
    'nohup gh $(cat a)',
    'if x; then :; elif gh $(cat a); then :; fi',
    'env -i PATH="$PATH" gh $(cat a)',
    'find . -name x -exec gh myext publish {} +',
    'echo "$(gh -- pr merge 3)"',
    'pnpm exec gh myext publish',
    'GH_TOKEN="$T" gh myext publish',
    'X="a b" gh $(cat args)',
    '/bin/bash -c "gh $CMD"',
    'echo "$(gh $CMD)"',
    'git commit -m "$(gh myext publish)"',
    'doas gh $(cat a)',
    "EDITOR='cat' gh myext publish",
    'git submodule foreach gh myext publish',
    'git rebase -x "gh myext publish" main',
    '"$(which gh)" myext publish',
    'f() { gh "$@"; }; f pr merge 3',
    'xargs -a args.txt gh',
    // Read generously: a `gh` any word follows is held, prose included.
    'grep -rn gh docs/',
    'git commit -m "docs: use gh instead"',
    'brew install gh jq',
    'find . | xargs grep gh',
    'G=gh; $G pr merge 3',
    'alias g=gh; g pr merge 3',
    'GH="$(command -v gh)"; "$GH" pr merge 3',
    'gh api "$@"',
    'gh api $(cat args.txt)',
    'xargs -a args.txt gh api',
    'gh api repos/o/r/issues $FLAGS',
    'gh api repos/o/r/pulls/1 --jq .title; gh api repos/o/r/issues $FLAGS',
    // eslint-disable-next-line no-template-curly-in-string -- a shell expansion.
    'gh api repos/o/r/issues "${ARGS[@]}"',
    // eslint-disable-next-line no-template-curly-in-string -- a shell expansion.
    'gh api repos/o/r/issues ${FLAGS:-}',
    'gh -R o/r api repos/o/r/issues $FLAGS',
    'gh api repos/o/r/issues 2>&1 $FLAGS',
    'G=gh; $G api repos/o/r/issues "$@"',
    'G=gh; $G repo view; $G myext publish',
    'G="command gh"; $G pr merge 3',
    "alias g='env gh'; g pr merge 3",
    'G="sudo gh"; $G pr merge 3',
    'alias g="GH_REPO=o/r gh"; g pr merge 3',
    // eslint-disable-next-line no-template-curly-in-string -- a shell expansion.
    'G=${GH_BIN:-gh}; $G pr merge 3',
    // eslint-disable-next-line no-template-curly-in-string -- a shell expansion.
    'G=(gh); "${G[@]}" pr merge 3',
    String.raw`G=\gh; $G pr merge 3`,
    'gh api repos/o/r/issues \\\n  $FLAGS',
    'gh $FLAGS api repos/o/r/issues',
    'gh api repos/o/r/pulls/1 --jq .title > "$OUT"',
    'G=; G+=gh; $G pr merge 3',
    // eslint-disable-next-line no-template-curly-in-string -- a shell expansion.
    'G[0]=gh; ${G[0]} pr merge 3',
    'G=\\\ngh; $G pr merge 3',
    "G=g''h; $G pr merge 3",
    'for G in gh; do $G pr merge 3; done',
    'printf -v G %s gh; $G pr merge 3',
    'read G <<< gh; $G pr merge 3',
    // Read generously: a `gh` beside a `$` may run under another name.
    'gh pr view $N',
    // A `\` continues a line with nothing between, as the shell joins it.
    'g\\\nh pr merge 3',
    'git pu\\\nsh',
    // `\` before a CRLF continues nothing: the shell runs the next line.
    'echo x\\\r\ngit push',
    // A glob gives `gh` its words.
    'gh *',
    'gh api repos/o/r/issues *',
    'gh -R o/r *',
    'echo $PATH | grep gh',
    // Read generously: any `$` beside a `gh` may give it words, so a read is
    // held too.
    'gh api repos/$OWNER/$REPO/pulls/12 --jq .title',
    'GH=/usr/local/bin/gh; $GH pr merge 3',
    'G=`which gh`; $G pr merge 3',
    'G=$(type -P gh); $G pr merge 3',
    'f() { gh -R "$@"; }; f o/r pr merge 3',
    'find . -name x -exec gh {} +',
    'curl -X POST -d @$GITHUB_EVENT_PATH https://hooks.example.com',
    'gh pr comment 3 --body "use -h"',
    'gh api repos/o/r/issues -f body="see --help"',
    'gh pr create --help',
    'curl -X POST -H "Authorization: Bearer $GH_PAT" "$URL"',
    'curl -X POST -H "Authorization: token $(cat ~/.github-token)" "$API/issues"',
    'git push -u origin claude/x',
    'git push --force-with-lease',
    'cd /x && git -C /x push origin HEAD',
    'timeout -s KILL 60 git push',
    'sudo -u u git push',
    "bash -c 'git push'",
    'git commit -qm "fix: x" && git push',
    "cat <<'EOF' > d.md\nbody\nEOF\ngit push",
    'pnpm run open-pr -- --body-file ./d.md',
    'pnpm -w run open-pr',
    'pnpm run push-fixed-pr -- 12',
    'pnpm run rework-pr -- done --requeue',
    'pnpm run start-issue -- 12 --by x',
    'pnpm run claim-pr -- 5 --by x',
    'pnpm run pr-description -- push 12 --file ./d.md',
    "pnpm run pr-description -- create --title 'fix: x' --file ./d.md --priority B",
    'curl -X POST https://api.github.com/repos/noshiro-pf/mono/issues -d @b.json',
    'curl --request=PATCH https://api.github.com/repos/noshiro-pf/mono/pulls/1',
    "curl -d '{}' https://api.github.com/repos/noshiro-pf/mono/issues/1/comments",
    'curl --json @b.json https://api.github.com/repos/noshiro-pf/mono/issues',
    'gh api --method PATCH repos/noshiro-pf/mono/pulls/1 -f body=x',
    'gh api repos/noshiro-pf/mono/issues/1/comments -F body=@c.md',
    'gh pr comment 12 --body-file ./c.md',
    'gh pr merge 12 --squash',
    "gh issue create --title 'x' --body 'y'",
    'gh release upload v1 notes.md',
    'curl -sSd @b.json https://api.github.com/repos/noshiro-pf/mono/issues',
    'curl -sXPOST https://api.github.com/repos/noshiro-pf/mono/issues',
    'curl --data-ascii x https://api.github.com/repos/noshiro-pf/mono/issues',
    'gh api repos/noshiro-pf/mono/issues -fbody=x',
    'gh api -iXPOST repos/noshiro-pf/mono/issues',
    'curl -sXpatch https://api.github.com/repos/noshiro-pf/mono/issues/1',
    'curl -X POST "$GITHUB_API_URL/repos/noshiro-pf/mono/issues/1/comments" -d @b.json',
    'curl -d @b.json "https://$GH_HOST/api/v3/repos/noshiro-pf/mono/issues"',
    // Read generously: one held call too many is the cheaper mistake.
    "grep -n 'git push' README.md",
  ])('holds `%s`', (command) => {
    assert.isTrue(isPublishingCommand(command));
  });

  test.each([
    'ls',
    'git status',
    'git stash push -m wip',
    'git log origin/main..HEAD',
    'cat libs/pr-merge-queue/src/open-pr/README.md',
    'pnpm run rework-pr -- start',
    'pnpm run pr-description -- read 12',
    'pnpm run pr-description -- check --file ./d.md',
    'curl -sS https://api.github.com/repos/noshiro-pf/mono',
    'curl -X POST https://example.com/hook',
    'gh pr view 12',
    'gh api repos/noshiro-pf/mono/pulls/12',
    'gh run view 3',
    'gh run list --workflow ci.yml',
    'set -euo pipefail; gh pr view 3',
    'grep -rn delete .github/workflows',
    'grep -rn delete .github',
    'grep -rn POST tools/scripts/lib/github.mts',
    'set -e; gh secret list',
    'gh --version',
    'gh pr -R o/r view 3',
    'echo "x=POST" >> "$GITHUB_OUTPUT"',
    'echo "m=POST" >> "$GITHUB_STATE"',
    'which gh',
    'ls ~/.config/gh',
    'find . -type d -name gh -print',
    'curl -X POST -d @"$GITHUB_WORKSPACE/payload.json" https://hooks.example.com',
    // eslint-disable-next-line no-template-curly-in-string -- a shell expansion.
    'curl -X POST -d "sha=${GITHUB_SHA::7}" https://hooks.example.com',
    'curl -X POST -d @high_priority.json https://hooks.example.com',
    'gh pr view 3 --repo someone/gh',
    'ls ~/.config/gh && echo ok',
    'go build ./cmd/gh',
    'cd ~/src/gh && pnpm test',
    'gh --help',
    'gh',
    'which -a gh',
    'command -v gh',
    'git commit -m "docs: mention gh"',
    'find . -name gh -type f',
    'gh pr view 3 --repo someone/gh --json title',
    'gh --hostname=ghe.example.com pr view 3',
    'gh --hostname ghe.example.com pr view 3',
    'gh version',
    'gh help pr',
    'gh pr list --label release',
    'gh run list --workflow release',
    'git log --author=gh-actions && pnpm run build',
    'GH_REPO=o/r gh pr view 3 && pnpm run build',
    'GH_HOST=ghe.example.com gh pr view 3; pnpm run check-changed',
    'NO_COLOR=1 FORCE=1 gh pr view 3',
    'GH_REPO=o/r GH_HOST=h gh pr view 3',
    'GH_REPO="o/r" gh pr view 3',
    'GH_PAGER="" gh pr view 3',
  ])('lets `%s` through', (command) => {
    assert.isFalse(isPublishingCommand(command));
  });
});

describe('findPrivatePointer', () => {
  test.each([
    `${PRIVATE_REPO}#13`,
    `https://github.com/${PRIVATE_REPO}/issues/13`,
    `see ${PRIVATE_REPO}/blob/main/x.md`,
    `https://github.com/${PRIVATE_REPO}/commits/abc123`,
    `https://github.com/${PRIVATE_REPO}/pulls?q=x`,
    `see ${PRIVATE_REPO} #13`,
    `${PRIVATE_REPO} の #13 を参照`,
    `${PRIVATE_REPO} の issue 13 を参照`,
    `${PRIVATE_REPO} issue #13`,
    `${PRIVATE_REPO}＃13`,
    `reported in ${PRIVATE_REPO} pull request #3`,
    `${PRIVATE_REPO}: #3`,
    `https://raw.githubusercontent.com/${PRIVATE_REPO}/main/findings/x.md`,
    `https://api.github.com/repos/${PRIVATE_REPO}/contents/findings/x.md`,
    `https://github.com/${PRIVATE_REPO}/blame/main/x.md`,
    `${PRIVATE_REPO} issue: #13`,
    `${PRIVATE_REPO} PR: #13`,
    `${PRIVATE_REPO}：#13`,
    `${PRIVATE_REPO} プルリクエスト #13`,
    `tracked at ${PRIVATE_REPO} pull #13`,
    `gh issue comment 1 --body 'see ${PRIVATE_REPO}#13'`,
    `echo '${PRIVATE_REPO} issue 13' > body.md`,
    `gh pr create --body "<li>${PRIVATE_REPO} issue 13</li>"`,
    `gh issue create --body-file - <<'EOF'\n<li>${PRIVATE_REPO} issue 13</li>\nEOF`,
    `cat > body.md <<EOF\n${PRIVATE_REPO} PR 13<br>\nEOF`,
    `<b>${PRIVATE_REPO}#13</b>`,
    `<li>${PRIVATE_REPO} issue #13</li>`,
    `${PRIVATE_REPO} PR 13<br />`,
    `Closes ${PRIVATE_REPO} issue 13<!-- note -->`,
    `${PRIVATE_REPO} PR 13<br/>`,
    `<li>${PRIVATE_REPO} issue 13</li>`,
    `${PRIVATE_REPO} PR 13<br>`,
    `tracked at ${PRIVATE_REPO} pull request 13`,
    `${PRIVATE_REPO}'s #13`,
    `${PRIVATE_REPO}, issue #13`,
    `${PRIVATE_REPO} のイシュー #13`,
    `see https://api.github.com/repos/${PRIVATE_REPO}/issues/13`,
    `fixed by ${PRIVATE_REPO}@abc1234`,
    `https://github.com/${PRIVATE_REPO}/runs/123`,
    ['mono-security', '4'].join('#'),
    `see ${PRIVATE_REPO}#13\r\nnext`,
  ])('finds a pointer in `%s`', (text) => {
    expect(findPrivatePointer(text)).toContain('mono-security');
  });

  test.each([
    `Findings go to the private \`${PRIVATE_REPO}\`, never here.`,
    'noshiro-pf/mono#13',
    `${PRIVATE_REPO} (where findings go)`,
    `\`${PRIVATE_REPO}\` (#4340 adds the gate)`,
    `touches ${PRIVATE_REPO}, #4340 adds the gate`,
    `${PRIVATE_REPO} と #4340`,
    `1. File it among ${PRIVATE_REPO} issues\n2. Then fix`,
    `the ${PRIVATE_REPO} PRs\n3 days later`,
    `${PRIVATE_REPO} ではなく #4340 で直す`,
    // A known gap, kept so: a rule that took it would take `と #4340` too.
    `${PRIVATE_REPO} に起票した #13`,
    `ends with ${PRIVATE_REPO}\n\n\n#4340 starts the next paragraph`,
    // A known gap, kept so: one line is read at a time, as nothing tells a
    // wrapped paragraph from a heading or a list item after it.
    `see ${PRIVATE_REPO}\n#13, wrapped`,
    `// tracked at ${PRIVATE_REPO}\n// #13`,
    `## Findings go to ${PRIVATE_REPO}\n#4340 fixes the public side.`,
    // A number a shell's redirection follows, or one after `pull` alone.
    `git -C ~/src/${PRIVATE_REPO} pull 2>&1 && git push`,
    `git -C ~/src/${PRIVATE_REPO} pull 0</dev/null && git push`,
    `git -C ~/src/${PRIVATE_REPO} pull 0</dev/null 2>&1 && git push`,
    `git -C ~/src/${PRIVATE_REPO} pull 0<in && git push >log`,
    `git -C ~/src/${PRIVATE_REPO} pull 1>out.txt`,
    `bash -c 'git -C ~/src/${PRIVATE_REPO} pull 0<in && git push'`,
    `ls ~/src/${PRIVATE_REPO} issue 2>/dev/null`,
    `ls ~/src/${PRIVATE_REPO} issue 2> /dev/null`,
    // A known gap, kept so: a number `>` follows reads as a redirection.
    `${PRIVATE_REPO} issue 13>`,
    // A known gap, kept so: `pull` alone is git's as often as GitHub's.
    `tracked at ${PRIVATE_REPO} pull 13`,
    `Run \`git -C ~/src/${PRIVATE_REPO} pull 2>&1\` first.`,
    // A local clone's path names no issue and no page of it.
    `cd ~/src/${['mono-security', 'docs'].join('/')} && ls`,
  ])('finds none in `%s`', (text) => {
    expect(findPrivatePointer(text)).toBeUndefined();
  });
});

describe('the hook', () => {
  test('lets a call that publishes nothing through', async () => {
    await withTemporaryDirectory(async (tmp) => {
      expect(await runHook(tmp, bash('git status'))).toStrictEqual({
        denied: false,
        reason: '',
      });

      const tools = [
        'pull_request_read',
        'actions_list',
        'actions_get',
        'get_me',
      ] as const;

      const verdicts = await Promise.all(
        tools.map(async (tool) =>
          isDenied(tmp, {
            tool_name: `mcp__github__${tool}`,
            tool_input: { owner: 'noshiro-pf', repo: 'mono' },
          }),
        ),
      );

      expect(verdicts).toStrictEqual([false, false, false, false]);
    });
  });

  test('holds a GitHub MCP server however it is named', async () => {
    await withTemporaryDirectory(async (tmp) => {
      assert.isTrue(
        await isDenied(tmp, {
          tool_name: 'mcp__claude_ai_GitHub__create_issue',
          tool_input: { owner: 'noshiro-pf', repo: 'mono', body: 'x' },
        }),
      );
    });
  });

  test('holds a public write once, and the identical call then passes', async () => {
    await withTemporaryDirectory(async (tmp) => {
      const reason = await reasonOf(tmp, comment('Fixed in this PR.'));

      expect(reason).toMatch(/^Held once/u);

      // The section the reason cites; `check:prose:claude-md-references` holds
      // it to a heading that exists.
      expect(reason).toContain('Private information');

      assert.isFalse(await isDenied(tmp, comment('Fixed in this PR.')));

      // Changed text is new text, and is held again.
      assert.isTrue(await isDenied(tmp, comment('Fixed in this PR, see #2.')));
    });
  });

  test('keeps one ledger per session', async () => {
    await withTemporaryDirectory(async (tmp) => {
      assert.isTrue(await isDenied(tmp, comment('x')));

      assert.isTrue(
        await isDenied(tmp, { ...comment('x'), session_id: 'session-2' }),
      );
    });
  });

  test('leaves MCP writes to the private repository alone', async () => {
    await withTemporaryDirectory(async (tmp) => {
      assert.isFalse(
        await isDenied(
          tmp,
          comment(`${PRIVATE_REPO}#3 again`, 'mono-security'),
        ),
      );
    });
  });

  test('refuses a pointer into the private repository every time', async () => {
    await withTemporaryDirectory(async (tmp) => {
      const body = `Closes ${PRIVATE_REPO}#3.` as const;

      const reason = await reasonOf(tmp, comment(body));

      expect(reason).toMatch(/^Refused: the tool input/u);

      expect(reason).toContain(`${PRIVATE_REPO}#3`);

      assert.isTrue(await isDenied(tmp, comment(body)));

      expect(
        await reasonOf(tmp, {
          tool_name: 'mcp__github__merge_pull_request',
          tool_input: {
            owner: 'noshiro-pf',
            repo: 'mono',
            pullNumber: 1,
            commit_message: body,
          },
        }),
      ).toMatch(/^Refused/u);
    });
  });

  test('reads the messages a push sends, from the directory it pushes from', async () => {
    await withTemporaryDirectory(async (tmp) => {
      const work = path.join(tmp, 'work');

      await git(tmp, ['init', '-q', '-b', 'main', work]);

      await git(work, ['commit', '-q', '--allow-empty', '-m', 'fix: clean']);

      const command = 'cd work && git push --force-with-lease';

      expect(await reasonOf(tmp, bash(command))).toMatch(/^Held once/u);

      assert.isFalse(await isDenied(tmp, bash(command)));

      // An amend in the directory pushed from is new text, wherever the session
      // itself is.
      await git(work, [
        'commit',
        '-q',
        '--allow-empty',
        '--amend',
        '-m',
        `fix: x\n\nCloses ${PRIVATE_REPO}#13.`,
      ]);

      expect(await reasonOf(tmp, bash(command))).toMatch(
        /^Refused: the message of commit/u,
      );
    });
  });

  test('names the commit and branch a refused message is on', async () => {
    await withTemporaryDirectory(async (tmp) => {
      await git(tmp, ['init', '-q', '-b', 'main']);

      await git(tmp, ['commit', '-q', '--allow-empty', '-m', 'fix: clean']);

      await git(tmp, ['checkout', '-q', '-b', 'scratch']);

      await git(tmp, [
        'commit',
        '-q',
        '--allow-empty',
        '-m',
        `wip\n\nsee ${PRIVATE_REPO}#4`,
      ]);

      await git(tmp, ['checkout', '-q', 'main']);

      expect(await reasonOf(tmp, bash('git push origin main'))).toMatch(
        /^Refused: the message of commit `[\da-f]+ scratch`/u,
      );
    });
  });

  test('leaves a commit on no branch to the review, named by hash or tag', async () => {
    await withTemporaryDirectory(async (tmp) => {
      await git(tmp, ['init', '-q', '-b', 'main']);

      await git(tmp, ['commit', '-q', '--allow-empty', '-m', 'fix: clean']);

      await git(tmp, [
        'commit',
        '-q',
        '--allow-empty',
        '-m',
        `fix: x\n\nsee ${PRIVATE_REPO}#4`,
      ]);

      // A tag a fetch brought in, or the head an amend just replaced: reading
      // either would refuse a push for a message it does not send.
      await git(tmp, ['tag', 'v1']);

      const revParse = await runFile('git', ['rev-parse', 'HEAD'], {
        cwd: tmp,
      });

      await git(tmp, ['reset', '-q', '--hard', 'HEAD~']);

      expect(
        await reasonOf(
          tmp,
          bash(
            `git range-diff ${revParse.stdout.trim()}...HEAD && git push origin main`,
          ),
        ),
      ).toMatch(/^Held once/u);
    });
  });

  test('reads a UTF-16 body file as text', async () => {
    await withTemporaryDirectory(async (tmp) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
      fs.writeFileSync(
        path.join(tmp, 'd.md'),
        Buffer.from(`see ${PRIVATE_REPO}#4\n`, 'utf16le'),
      );

      expect(
        await reasonOf(tmp, bash('gh pr create --body-file d.md')),
      ).toMatch(/^Refused/u);
    });
  });

  test('takes no method, template or content for a body file', async () => {
    await withTemporaryDirectory(async (tmp) => {
      const commands = [
        'curl -XPOST https://api.github.com/repos/noshiro-pf/mono/issues -d x',
        'curl -XPATCH https://api.github.com/repos/noshiro-pf/mono/issues/1 -d x',
        'gh issue create -T "Bug report" --title x --body y',
        'curl --data-urlencode "q=a@example.com" -X POST https://api.github.com/repos/noshiro-pf/mono/issues',
        // `-T` is `gh`'s, though `curl` runs beside it.
        'gh issue create -T "Bug report" --title x --body y && curl -d x https://api.github.com/repos/noshiro-pf/mono/issues',
      ] as const;

      const reasons = await Promise.all(
        commands.map(async (command) => reasonOf(tmp, bash(command))),
      );

      expect(
        reasons.filter((reason) => reason.includes('could not read')),
      ).toStrictEqual([]);
    });
  });

  test('reads the body file of a curl cluster or upload', async () => {
    await withTemporaryDirectory(async (tmp) => {
      write(path.join(tmp, 'b.json'), `{"body":"see ${PRIVATE_REPO}#4"}`);

      const commands = [
        'curl -sSd@b.json https://api.github.com/repos/noshiro-pf/mono/issues',
        'curl -X PUT -T b.json https://api.github.com/repos/noshiro-pf/mono/contents/x',
        'curl -sST b.json -X PUT https://api.github.com/repos/noshiro-pf/mono/contents/x',
        'curl -X PUT -sSTb.json https://api.github.com/repos/noshiro-pf/mono/contents/x',
        'curl --data-urlencode body@b.json -X POST https://api.github.com/repos/noshiro-pf/mono/issues/1/comments',
        'curl -X POST \\\n  -T b.json https://api.github.com/repos/noshiro-pf/mono/issues',
      ] as const;

      const reasons = await Promise.all(
        commands.map(async (command) => reasonOf(tmp, bash(command))),
      );

      expect(
        reasons.map((reason) => reason.slice(0, 'Refused'.length)),
      ).toStrictEqual(commands.map(() => 'Refused'));
    });
  });

  test('reads a repository once from a working directory, its worktrees too', async () => {
    await withTemporaryDirectory(async (tmp) => {
      const repo = path.join(tmp, 'repo');

      await git(tmp, ['init', '-q', '-b', 'main', repo]);

      await git(repo, ['commit', '-q', '--allow-empty', '-m', 'fix: x']);

      await git(repo, ['worktree', 'add', '-q', path.join(tmp, 'wt')]);

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
      fs.mkdirSync(path.join(repo, 'sub'));

      const reason = await reasonOf(
        tmp,
        bash('cd repo/sub && make && cd ../../wt && make && git push'),
      );

      // One repository, read from the first of its directories named.
      expect(reason).toContain(`sending the commits of \`${repo}/sub\` that`);

      vi.stubEnv('GIT_CONFIG_COUNT', '1');

      vi.stubEnv('GIT_CONFIG_KEY_0', 'safe.bareRepository');

      vi.stubEnv('GIT_CONFIG_VALUE_0', 'explicit');

      try {
        await git(repo, [
          'commit',
          '-q',
          '--allow-empty',
          '-m',
          `fix: y\n\nCloses ${PRIVATE_REPO}#13.`,
        ]);

        // Read from the working directory, which that setting leaves alone.
        expect(await reasonOf(tmp, bash('cd repo && git push'))).toMatch(
          /^Refused/u,
        );
      } finally {
        vi.unstubAllEnvs();
      }
    });
  });

  test('reads the messages of a bare repository pushed from', async () => {
    await withTemporaryDirectory(async (tmp) => {
      const work = path.join(tmp, 'work');

      await git(tmp, ['init', '-q', '--bare', 'mirror.git']);

      await git(tmp, ['init', '-q', '-b', 'main', work]);

      await git(work, [
        'commit',
        '-q',
        '--allow-empty',
        '-m',
        `fix: x\n\nCloses ${PRIVATE_REPO}#13.`,
      ]);

      await git(work, ['push', '-q', path.join(tmp, 'mirror.git'), 'main']);

      expect(
        await reasonOf(tmp, bash('git -C mirror.git push --mirror')),
      ).toMatch(/^Refused/u);
    });
  });

  test('reads the repository a subdirectory is in, past many subshells', async () => {
    await withTemporaryDirectory(async (tmp) => {
      const other = path.join(tmp, 'other');

      await git(tmp, ['init', '-q', '-b', 'main', other]);

      await git(other, [
        'commit',
        '-q',
        '--allow-empty',
        '-m',
        `fix: x\n\nCloses ${PRIVATE_REPO}#13.`,
      ]);

      const letters = Array.from('abcdefghijklm');

      for (const letter of letters) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
        fs.mkdirSync(path.join(other, 'libs', letter), { recursive: true });
      }

      // `other` itself falls past the bound; its subdirectories lead back to
      // it.
      const command = [
        'cd other',
        ...letters.map((letter) => `(cd libs/${letter} && make)`),
        'git push',
      ].join(' && ');

      expect(await reasonOf(tmp, bash(command))).toMatch(/^Refused/u);
    });
  });

  test('keeps the directory pushed from past many others, and its body file', async () => {
    await withTemporaryDirectory(async (tmp) => {
      const other = path.join(tmp, 'other');

      await git(tmp, ['init', '-q', '-b', 'main', other]);

      await git(other, [
        'commit',
        '-q',
        '--allow-empty',
        '-m',
        `fix: x\n\nCloses ${PRIVATE_REPO}#13.`,
      ]);

      const letters = Array.from('abcdefghijklmn');

      for (const letter of letters) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
        fs.mkdirSync(path.join(tmp, 'libs', letter), { recursive: true });
      }

      const command = Arr.toPushed(
        letters.map((letter, index) =>
          index === 0 ? `cd libs/${letter} && make` : `cd ../${letter} && make`,
        ),
        'cd ../../other && git push',
      ).join(' && ');

      expect(await reasonOf(tmp, bash(command))).toMatch(/^Refused/u);

      // The body file beside the directory gone back to, read as well as the
      // one beside the session's parent.
      const session = path.join(tmp, 'session');

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
      fs.mkdirSync(path.join(session, 'sub'), { recursive: true });

      write(path.join(session, 'body.md'), `See ${PRIVATE_REPO}/issues/3.`);

      write(path.join(tmp, 'body.md'), 'clean');

      expect(
        await reasonOf(
          session,
          bash('cd sub && ls && cd .. && gh pr create --body-file body.md'),
        ),
      ).toMatch(/^Refused/u);
    });
  });

  test('reads every directory the command may push from', async () => {
    await withTemporaryDirectory(async (tmp) => {
      const other = path.join(tmp, 'a', 'other');

      await git(tmp, ['init', '-q', '-b', 'main', other]);

      await git(other, [
        'commit',
        '-q',
        '--allow-empty',
        '-m',
        `fix: x\n\nCloses ${PRIVATE_REPO}#13.`,
      ]);

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
      fs.mkdirSync(path.join(tmp, 'a', 'libs', 'x'), { recursive: true });

      // Each resolves `other` somewhere, and one of the places is `a/other`:
      // which the shell is in is not worked out, every candidate is read.
      const commands = [
        'cd a && cd other && git push',
        'cd a && (cd libs/x && pnpm build) && git -C other push',
        'cd a && pushd libs && (pushd x && make) && popd && git -C other push',
        'cd a && pushd -n libs && popd && git -C other push',
        'cd a && pushd "$(git rev-parse --show-toplevel)" && popd && git -C other push',
        'cd a && cd "$(git rev-parse --show-toplevel)" && cd other && git push',
        '(cd a && git commit -m "wip (part") && cd a && git -C other push',
        "cat <<'EOF'\nIt's done\nEOF\ncd a/other && git commit -m 'x' && git push",
        'cd "a" && git -C "other" push',
      ] as const;

      const reasons = await Promise.all(
        commands.map(async (command) => reasonOf(tmp, bash(command))),
      );

      expect(
        reasons.map((reason) => reason.slice(0, 'Refused'.length)),
      ).toStrictEqual(commands.map(() => 'Refused'));
    });
  });

  test('says when it read only the newest messages', async () => {
    await withTemporaryDirectory(async (tmp) => {
      await git(tmp, ['init', '-q', '-b', 'main']);

      // 101 commits, one past the messages read, made at once.
      const script = Array.from(
        { length: 101 },
        (_, index) =>
          `commit refs/heads/main\ncommitter a <a@example.com> ${index} +0000\ndata 1\n${index % 10}\n`,
      ).join('');

      const imported = await runFile('git', ['fast-import', '--quiet'], {
        cwd: tmp,
        input: script,
      });

      expect(imported.status).toBe(0);

      expect(await reasonOf(tmp, bash('git push origin main'))).toContain(
        'read only the newest 100 messages',
      );
    });
  });

  test('holds a push once per commit checked out', async () => {
    await withTemporaryDirectory(async (tmp) => {
      await git(tmp, ['init', '-q', '-b', 'main']);

      await git(tmp, ['commit', '-q', '--allow-empty', '-m', 'fix: x']);

      const command = 'git push -u origin main';

      expect(await reasonOf(tmp, bash(command))).toContain(
        'that no remote has',
      );

      assert.isFalse(await isDenied(tmp, bash(command)));

      await git(tmp, [
        'commit',
        '-q',
        '--allow-empty',
        '--amend',
        '-m',
        'fix: y',
      ]);

      assert.isTrue(await isDenied(tmp, bash(command)));

      assert.isFalse(await isDenied(tmp, bash(command)));
    });
  });

  test('reads the body file a command publishes', async () => {
    await withTemporaryDirectory(async (tmp) => {
      const file = path.join(tmp, 'd.md');

      const command = 'pnpm run pr-description -- push 12 --file ./d.md';

      write(file, `See ${PRIVATE_REPO}/issues/3.`);

      expect(await reasonOf(tmp, bash(command))).toMatch(
        // Named by the path read, which says which copy holds the pointer.
        /^Refused: the file `\/.+\/d\.md`/u,
      );

      write(file, 'Clean.');

      assert.isTrue(await isDenied(tmp, bash(command)));

      assert.isFalse(await isDenied(tmp, bash(command)));

      // The same command with another file content is held again.
      write(file, 'Clean, and longer.');

      assert.isTrue(await isDenied(tmp, bash(command)));
    });
  });

  test('reads a body file however the command names it', async () => {
    await withTemporaryDirectory(async (tmp) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
      fs.mkdirSync(path.join(tmp, 'sub'));

      write(path.join(tmp, 'c.md'), `See ${PRIVATE_REPO}/issues/3.`);

      write(path.join(tmp, 'sub', 'body.md'), `See ${PRIVATE_REPO}/issues/4.`);

      const commands = [
        'pnpm run pr-description -- push 12 --file=./c.md',
        'gh api repos/noshiro-pf/mono/issues/1/comments -F body=@c.md',
        'curl -d @c.md https://api.github.com/repos/noshiro-pf/mono/issues/1/comments',
        'gh pr create --body "$(cat c.md)"',
        'gh pr create --body-file - < c.md',
        'cd sub && gh pr create --body-file body.md',
      ] as const;

      const reasons = await Promise.all(
        commands.map(async (command) => reasonOf(tmp, bash(command))),
      );

      expect(
        reasons.map((reason) => reason.slice(0, 'Refused'.length)),
      ).toStrictEqual(commands.map(() => 'Refused'));
    });
  });

  test('reads a body file under ~, and names one it cannot read', async () => {
    await withTemporaryDirectory(async (tmp) => {
      write(path.join(tmp, 'gatebody.md'), `See ${PRIVATE_REPO}/issues/3.`);

      vi.stubEnv('HOME', tmp);

      try {
        expect(
          await reasonOf(
            tmp,
            bash('pnpm run pr-description -- push 12 --file ~/gatebody.md'),
          ),
        ).toMatch(/^Refused/u);
      } finally {
        vi.unstubAllEnvs();
      }

      expect(
        await reasonOf(
          tmp,
          bash('pnpm run pr-description -- push 12 --file ./missing.md'),
        ),
      ).toContain('`./missing.md`, which this hook could not read');

      expect(
        await reasonOf(tmp, bash('printf x | gh pr create --body-file -')),
      ).toContain('`standard input`, which this hook could not read');

      // A body's HTML tag is no file it reads.
      expect(
        await reasonOf(
          tmp,
          bash(
            "gh pr create --title x --body '<li>a</li><br /><a href=x>y</a> Promise<string> `<button>`'",
          ),
        ),
      ).not.toContain('could not read');

      write(path.join(tmp, 'body.md'), `see ${PRIVATE_REPO}#13`);

      write(path.join(tmp, 'a', 'body.md'), `see ${PRIVATE_REPO}#13`);

      write(path.join(tmp, 'body'), `see ${PRIVATE_REPO}#13`);

      write(path.join(tmp, 'b'), `see ${PRIVATE_REPO}#13`);

      write(path.join(tmp, 'summary'), `see ${PRIVATE_REPO}#13`);

      // A file with a tag's name is read all the same.
      expect(
        await reasonOf(tmp, bash('gh pr create --body "$(cat b)"')),
      ).toMatch(/^Refused/u);

      expect(
        await reasonOf(tmp, bash('gh pr create --body-file - < summary')),
      ).toMatch(/^Refused/u);

      expect(
        await reasonOf(tmp, bash('gh pr create --body-file - <body>/dev/null')),
      ).toMatch(/^Refused/u);

      expect(
        await reasonOf(tmp, bash('gh pr create --body-file - < a/body.md')),
      ).toMatch(/^Refused/u);

      expect(
        await reasonOf(
          tmp,
          bash('gh pr create --title x --body-file - <body.md 2>/dev/null'),
        ),
      ).toMatch(/^Refused/u);

      // Named, rather than read until the hook's timeout.
      expect(
        await reasonOf(tmp, bash('gh pr create --body-file /dev/zero')),
      ).toContain('`/dev/zero`, which this hook could not read');
    });
  });

  test('sends a Bash write to the private repository to the MCP tools', async () => {
    await withTemporaryDirectory(async (tmp) => {
      write(path.join(tmp, 'f.json'), '{"title":"x","body":"see #3"}');

      // Named without a path, it is no pointer, and is held like any write.
      expect(
        await reasonOf(
          tmp,
          bash(`gh issue create -R ${PRIVATE_REPO} --body-file f.json`),
        ),
      ).toMatch(/^Held once/u);

      // By its REST path, it is refused, with the way that is left alone.
      expect(
        await reasonOf(
          tmp,
          bash(
            `curl -X POST https://api.github.com/repos/${PRIVATE_REPO}/issues -d @f.json`,
          ),
        ),
      ).toContain('use the GitHub MCP tools');

      // A command's own text is read generously, so the refusal says how a
      // command that publishes nothing gets past it.
      expect(
        await reasonOf(
          tmp,
          bash(`echo ${PRIVATE_REPO}#3 > notes.txt && git push --dry-run`),
        ),
      ).toContain('with the Write tool');
    });
  });

  test('refuses a pointer in a command read generously, and says the way past', async () => {
    await withTemporaryDirectory(async (tmp) => {
      // It may publish nothing, but a pointer is never held once: the reason
      // says to put such text in a file instead.
      expect(
        await reasonOf(
          tmp,
          bash(`grep -rn "gh token" notes.md # ${PRIVATE_REPO}#4`),
        ),
      ).toMatch(/^Refused[\s\S]*with the Write tool/u);
    });
  });

  test('names a push whose repository it cannot find', async () => {
    await withTemporaryDirectory(async (tmp) => {
      expect(await reasonOf(tmp, bash('git push'))).toContain(
        'whose repository this hook could not find',
      );
    });
  });

  test('is silent on input it cannot read', async () => {
    await withTemporaryDirectory(async (tmp) => {
      const result = await runFile(process.execPath, [scriptPath], {
        input: 'not json',
        env: { ...process.env, TMPDIR: ledger(tmp) },
      });

      expect(result).toMatchObject({ status: 0, stdout: '' });
    });
  });
});
