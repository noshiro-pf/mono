import { ok, recordedTransport } from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { Config } from '../../config/index.mjs';
import { prDescription, pulledPath, type DescriptionWorld } from './main.mjs';
import type { DescriptionCommand } from './options.mjs';

const CONFIG: Config = {
  autoFix: undefined,
  generatedBranches: [],
  translation: '日本語',
  openingHeading: 'Background',
  regenerate: undefined,
  speculate: undefined,
} as const;

const BODY = [
  '## Background',
  '',
  'Fixes the parser (#12).',
  '',
  '## Review',
  '',
  '`/code-review high`, 1 round.',
  '',
  '## 日本語',
  '',
  '### 背景',
  '',
  'パーサを直す (#12)。',
  '',
  '### レビュー',
  '',
  '1 ラウンド。',
  '',
  '---',
  '',
  'Closes #12',
].join('\n');

const ISSUE = '/repos/o/n/issues/5';

const REPOSITORY = 'https://api.github.com/repos/o/n';

const run = async (
  command: DescriptionCommand,
  routes: Parameters<typeof recordedTransport>[0],
  files: ReadonlyRecord<string, string> = {},
): Promise<
  Readonly<{
    result: Result<string, string>;
    files: ReadonlyMap<string, string>;
    writes: readonly string[];
    requests: number;
  }>
> => {
  // No `/user`: the command does not ask whose the token is.
  const { transport, sent } = recordedTransport({
    '/repos/o/n': ok({ full_name: 'o/n', default_branch: 'main' }),
    ...routes,
  });

  const mut_files = new Map(Object.entries(files));

  const world: DescriptionWorld = {
    transport,
    env: { GH_TOKEN: 'token' },
    originUrl: () => Promise.resolve(undefined),
    manifestUrl: () => Promise.resolve(undefined),
    ghAuthToken: () => Promise.resolve(Result.err('no gh')),
    readConfig: () => Promise.resolve(Result.ok(CONFIG)),
    readText: (path) => {
      const text = mut_files.get(path);

      return Promise.resolve(
        text === undefined
          ? Result.err(`cannot read ${path}`)
          : Result.ok(text),
      );
    },
    writeText: (path, text) => {
      mut_files.set(path, text);

      return Promise.resolve(Result.ok(undefined));
    },
    log: () => {},
  } as const;

  const result = await prDescription(command, world);

  return {
    result,
    files: mut_files,
    requests: sent.length,
    writes: sent
      .filter(({ method }) => method !== 'GET')
      .map(({ method, url, body }) => `${method} ${url} ${body ?? ''}`),
  };
};

describe(prDescription, () => {
  test('checks a file against the rules, the opening heading included', async () => {
    const [good, bad] = await Promise.all([
      run({ kind: 'check', file: 'd.md', issue: false }, {}, { 'd.md': BODY }),
      run(
        { kind: 'check', file: 'd.md', issue: false },
        {},
        { 'd.md': BODY.replace('## Background', '## Summary') },
      ),
    ]);

    assert.deepStrictEqual(
      good.result,
      Result.ok(
        'd.md: the original and its translation mirror each other, the deferred findings give their reasons, and the original opens with "## Background"',
      ),
    );

    assert.isTrue(Result.isErr(bad.result));

    expect(bad.result.value).toContain('the original opens with "## Summary"');
  });

  test('reads a description with its translation left out', async () => {
    const { result } = await run(
      { kind: 'read', number: 5, repo: 'o/n' },
      {
        [ISSUE]: ok({
          body: BODY,
          repository_url: REPOSITORY,
          pull_request: {},
        }),
      },
    );

    assert.isTrue(Result.isOk(result));

    expect(result.value).not.toContain('パーサ');

    expect(result.value).toContain('lines left out by `pr-description read`');
  });

  test('pulls into the file and its record, and refuses over an edit not pushed', async () => {
    const [pulled, held] = await Promise.all([
      run(
        { kind: 'pull', number: 5, file: 'd.md', repo: 'o/n' },
        {
          [ISSUE]: ok({
            body: BODY,
            repository_url: REPOSITORY,
            pull_request: {},
          }),
        },
      ),
      run(
        { kind: 'pull', number: 5, file: 'd.md', repo: 'o/n' },
        {
          [ISSUE]: ok({
            body: BODY,
            repository_url: REPOSITORY,
            pull_request: {},
          }),
        },
        { 'd.md': 'edited', [pulledPath('d.md')]: BODY },
      ),
    ]);

    assert.deepStrictEqual(
      [pulled.files.get('d.md'), pulled.files.get(pulledPath('d.md'))],
      [BODY, BODY],
    );

    assert.isTrue(Result.isErr(held.result));

    expect(held.result.value).toMatch(
      /^d\.md holds an edit that was not pushed/u,
    );

    // Told before anything is asked of GitHub.
    assert.strictEqual(held.requests, 0);
  });

  test('refuses a push with nothing pulled before asking GitHub anything', async () => {
    const { result, requests } = await run(
      {
        kind: 'push',
        number: 5,
        file: 'd.md',
        wordingOnly: false,
        repo: 'o/n',
      },
      {},
      { 'd.md': BODY },
    );

    assert.isTrue(Result.isErr(result));

    expect(result.value).toMatch(/^d\.md\.pulled is missing/u);

    assert.strictEqual(requests, 0);
  });

  test('pushes an edit to both halves, and records what GitHub holds', async () => {
    const edited = BODY.replace('(#12).', '(#12) again.').replace(
      '(#12)。',
      '(#12) をもう一度。',
    );

    const { result, files, writes } = await run(
      {
        kind: 'push',
        number: 5,
        file: 'd.md',
        wordingOnly: false,
        repo: 'o/n',
      },
      {
        [ISSUE]: ok({
          body: BODY,
          repository_url: REPOSITORY,
          pull_request: {},
        }),
        [`PATCH ${ISSUE}`]: ok({}),
      },
      { 'd.md': edited, [pulledPath('d.md')]: BODY },
    );

    assert.deepStrictEqual(
      [result, files.get(pulledPath('d.md')), writes],
      [
        Result.ok('#5: description written'),
        edited,
        [
          `PATCH https://api.github.com${ISSUE} ${JSON.stringify({ body: edited })}`,
        ],
      ],
    );
  });

  test('refuses an issue transferred away, and an unchanged push over a change on GitHub', async () => {
    const [transferred, unchanged] = await Promise.all([
      run(
        { kind: 'read', number: 5, repo: 'o/n' },
        {
          [ISSUE]: ok({
            body: BODY,
            repository_url: 'https://api.github.com/repos/o/other',
          }),
        },
      ),
      run(
        {
          kind: 'push',
          number: 5,
          file: 'd.md',
          wordingOnly: false,
          repo: 'o/n',
        },
        {
          [ISSUE]: ok({
            body: `${BODY}\n`,
            repository_url: REPOSITORY,
            pull_request: {},
          }),
        },
        { 'd.md': BODY, [pulledPath('d.md')]: BODY },
      ),
    ]);

    assert.isTrue(Result.isErr(transferred.result));

    expect(transferred.result.value).toMatch(
      /^cannot read #5 \(malformed\): it answers as o\/other's/u,
    );

    // "Unchanged" would say the copy is GitHub's still, which it is not.
    assert.deepStrictEqual(
      unchanged.result,
      Result.err(
        '#5 changed on GitHub since it was pulled; pull it again and make the edit on what is there now',
      ),
    );
  });

  test('refuses a push over a change on GitHub, and an edit to one half alone', async () => {
    const oneHalf = BODY.replace('(#12).', '(#12) again.');

    const [moved, lopsided, wordingOnly] = await Promise.all([
      run(
        {
          kind: 'push',
          number: 5,
          file: 'd.md',
          wordingOnly: false,
          repo: 'o/n',
        },
        {
          [ISSUE]: ok({
            body: `${BODY}\n`,
            repository_url: REPOSITORY,
            pull_request: {},
          }),
        },
        { 'd.md': oneHalf, [pulledPath('d.md')]: BODY },
      ),
      run(
        {
          kind: 'push',
          number: 5,
          file: 'd.md',
          wordingOnly: false,
          repo: 'o/n',
        },
        {
          [ISSUE]: ok({
            body: BODY,
            repository_url: REPOSITORY,
            pull_request: {},
          }),
        },
        { 'd.md': oneHalf, [pulledPath('d.md')]: BODY },
      ),
      run(
        {
          kind: 'push',
          number: 5,
          file: 'd.md',
          wordingOnly: true,
          repo: 'o/n',
        },
        {
          [ISSUE]: ok({
            body: BODY,
            repository_url: REPOSITORY,
            pull_request: {},
          }),
          [`PATCH ${ISSUE}`]: ok({}),
        },
        { 'd.md': oneHalf, [pulledPath('d.md')]: BODY },
      ),
    ]);

    assert.deepStrictEqual(
      [moved.result, moved.writes, lopsided.writes, wordingOnly.result],
      [
        Result.err(
          '#5 changed on GitHub since it was pulled; pull it again and make the edit on what is there now',
        ),
        [],
        [],
        Result.ok('#5: description written'),
      ],
    );

    assert.isTrue(Result.isErr(lopsided.result));

    expect(lopsided.result.value).toContain(
      'the original changed and the translation did not',
    );
  });

  test('files an issue under its tier, and refuses one with a close title', async () => {
    const issueBody = BODY.replace('## Background\n\n', '').replace(
      '### 背景\n\n',
      '',
    );

    const command = {
      kind: 'create',
      title: 'fix: the parser drops a token',
      file: 'i.md',
      priority: 'B',
      labels: ['bug'],
      notDuplicates: [],
      repo: 'o/n',
    } as const;

    const [filed, refused] = await Promise.all([
      run(command, openIssue('docs: a typo'), { 'i.md': issueBody }),
      run(command, openIssue('fix: the parser drops a token'), {
        'i.md': issueBody,
      }),
    ]);

    assert.deepStrictEqual(
      [filed.result, filed.writes, refused.writes],
      [
        Result.ok('#9: u9'),
        [
          `POST https://api.github.com/repos/o/n/issues ${JSON.stringify({
            title: command.title,
            body: issueBody,
            labels: ['bug', 'priority:B'],
          })}`,
        ],
        [],
      ],
    );

    assert.isTrue(Result.isErr(refused.result));

    expect(refused.result.value).toMatch(
      /^refused: an open issue has a title close/u,
    );
  });
});

const openIssue = (title: string): Parameters<typeof recordedTransport>[0] =>
  ({
    '/repos/o/n/issues?state=open&per_page=100': ok([
      { number: 3, title, body: null, html_url: 'u3' },
    ]),
    'POST /repos/o/n/issues': ok({ number: 9, html_url: 'u9' }),
  }) as const;
