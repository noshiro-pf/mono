import { ok, recordedTransport, status } from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { Config } from '../../config/index.mjs';
import { openPr, type OpenPrWorld } from './main.mjs';
import type { OpenPrOptions } from './options.mjs';

const OPTIONS: OpenPrOptions = {
  title: undefined,
  bodyFile: undefined,
  base: undefined,
  mergeAfter: [],
  mergeBefore: [],
  dryRun: false,
} as const;

const CONFIG: Config = {
  autoFix: undefined,
  generatedBranches: [],
  translation: '日本語',
  openingHeading: 'Background',
  regenerate: undefined,
  speculate: undefined,
} as const;

const OWN = 'https://api.github.com/repos/o/n';

const headed = (branch: string): string =>
  `/repos/o/n/pulls?state=open&per_page=2&head=o%3A${branch}` as const;

const target = (
  number: number,
  base: string,
  draft = false,
): ReadonlyRecord<string, unknown> =>
  ({ number, node_id: `PR_${number}`, draft, base: { ref: base } }) as const;

const closes = (number: number): string =>
  `<p><span class="issue-keyword tooltipped">Closes</span> <a data-hovercard-type="issue" data-url="https://github.com/o/n/issues/${number}">#${number}</a></p>` as const;

/** Pull request `number`'s body, as `open-pr` reads it once it exists. */
const exists = (
  number: number,
  body: string,
  bodyHtml: string,
): Parameters<typeof recordedTransport>[0] =>
  ({
    [`/repos/o/n/pulls/${number}`]: ok({ body, body_html: bodyHtml }),
  }) as const;

const run = async (
  options: Partial<OpenPrOptions>,
  routes: Parameters<typeof recordedTransport>[0],
  context: Readonly<{
    branch?: string;
    files?: ReadonlyRecord<string, string>;
    contains?: boolean;
  }> = {},
): Promise<
  Readonly<{
    result: Result<string, string>;
    /** What was done, in order: pushes, base checks and writes. */
    acts: readonly string[];
  }>
> => {
  const recorded = recordedTransport({
    '/repos/o/n': ok({ full_name: 'o/n', default_branch: 'main' }),
    ...routes,
  });

  const mut_acts: string[] = [];

  const files = context.files ?? {};

  const world: OpenPrWorld = {
    // Each write said where it happens among the git steps.
    transport: async (request) => {
      if (request.method !== 'GET') {
        mut_acts.push(
          `${request.method} ${request.url.replace('https://api.github.com/repos/o/n', '')} ${request.body ?? ''}`.trim(),
        );
      }

      return recorded.transport(request);
    },
    env: { GH_TOKEN: 'token' },
    originUrl: () => Promise.resolve('https://github.com/o/n.git'),
    manifestUrl: () => Promise.resolve(undefined),
    ghAuthToken: () => Promise.resolve(Result.err('no gh')),
    readConfig: () => Promise.resolve(Result.ok(CONFIG)),
    readText: (path) => {
      const text = files[path];

      return Promise.resolve(
        text === undefined
          ? Result.err(`cannot read ${path}`)
          : Result.ok(text),
      );
    },
    log: () => {},
    git: {
      branch: () => Promise.resolve(Result.ok(context.branch ?? 'feature')),
      lastSubject: () => Promise.resolve(Result.ok('feat: a thing')),
      push: (branch) => {
        mut_acts.push(`push ${branch}`);

        return Promise.resolve(Result.ok(undefined));
      },
      containsBase: (base) => {
        mut_acts.push(`contains ${base}`);

        return Promise.resolve(
          context.contains === false
            ? Result.err('not contained')
            : Result.ok(undefined),
        );
      },
    },
  } as const;

  const result = await openPr({ ...OPTIONS, ...options }, world);

  return {
    result,
    acts: mut_acts,
  };
};

describe(openPr, () => {
  test('pushes, opens it ready for review, and puts skip-ci on before auto-rebase', async () => {
    const { result, acts } = await run(
      {},
      {
        [headed('feature')]: ok([]),
        'POST /repos/o/n/pulls': ok({ number: 9 }),
        'POST /repos/o/n/issues/9/labels': ok([]),
        ...exists(9, '', ''),
      },
    );

    assert.isTrue(Result.isOk(result));

    expect(result.value).toContain('#9: opened');

    assert.deepStrictEqual(acts, [
      'push feature',
      'POST /pulls {"head":"feature","base":"main","title":"feat: a thing","body":"","draft":false}',
      'POST /issues/9/labels {"labels":["skip-ci"]}',
      'POST /issues/9/labels {"labels":["auto-rebase"]}',
    ]);
  });

  test('refuses the default branch, before any write', async () => {
    const { result, acts } = await run({}, {}, { branch: 'main' });

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(acts, []);
  });

  test('refuses a body whose halves do not mirror each other, before the push', async () => {
    const { result, acts } = await run(
      { bodyFile: 'b.md' },
      { [headed('feature')]: ok([]) },
      { files: { 'b.md': '## Background\n\nOnly one half.\n' } },
    );

    assert.isTrue(Result.isErr(result));

    expect(result.value).toContain('b.md:');

    assert.deepStrictEqual(acts, []);
  });

  test('refuses another base than the one open already, before the push', async () => {
    const { result, acts } = await run(
      { base: 'other' },
      { [headed('feature')]: ok([target(9, 'main')]) },
    );

    assert.isTrue(Result.isErr(result));

    expect(result.value).toContain('does not move an open pull request');

    assert.deepStrictEqual(acts, []);
  });

  test('stacks on the open pull request of --base, declaring it first', async () => {
    const { result, acts } = await run(
      { base: 'below', mergeAfter: [3] },
      {
        [headed('feature')]: ok([]),
        [headed('below')]: ok([target(4, 'main')]),
        'POST /repos/o/n/pulls': ok({ number: 9 }),
        'POST /repos/o/n/issues/9/labels': ok([]),
        ...exists(9, 'Merge-After: #4, #3\n', ''),
      },
    );

    assert.isTrue(Result.isOk(result));

    expect(result.value).toContain('once #4 has merged');

    assert.deepStrictEqual(Arr.take(acts, 3), [
      'contains below',
      'push feature',
      String.raw`POST /pulls {"head":"feature","base":"below","title":"feat: a thing","body":"Merge-After: #4, #3\n","draft":false}`,
    ]);
  });

  test('refuses a --base no open pull request is from, or a branch without its tip', async () => {
    const [none, behind] = await Promise.all([
      run(
        { base: 'gone' },
        { [headed('feature')]: ok([]), [headed('gone')]: ok([]) },
      ),
      run(
        { base: 'below' },
        {
          [headed('feature')]: ok([]),
          [headed('below')]: ok([target(4, 'main')]),
        },
        { contains: false },
      ),
    ]);

    assert.isTrue(Result.isErr(none.result));

    assert.isTrue(Result.isErr(behind.result));

    assert.deepStrictEqual(behind.acts, ['contains below']);
  });

  test('finishes one open already: its own base, the layer below added to its body, a draft marked ready', async () => {
    const { result, acts } = await run(
      {},
      {
        [headed('feature')]: ok([target(9, 'below', true)]),
        [headed('below')]: ok([target(4, 'main')]),
        'POST /repos/o/n/issues/9/labels': ok([]),
        ...exists(9, 'Prose.', ''),
        'graphql:markPullRequestReadyForReview': ok({ data: {} }),
        'PATCH /repos/o/n/issues/9': ok({}),
      },
    );

    assert.isTrue(Result.isOk(result));

    expect(result.value).toContain('open already');

    assert.deepStrictEqual(Arr.take(acts, 4), [
      'contains below',
      'push feature',
      'POST /issues/9/labels {"labels":["skip-ci"]}',
      'POST /issues/9/labels {"labels":["auto-rebase"]}',
    ]);

    expect(acts[4]).toContain('markPullRequestReadyForReview');

    assert.strictEqual(
      acts[5],
      String.raw`PATCH /issues/9 {"body":"Merge-After: #4\n\nProse."}`,
    );
  });

  test('declares the open pull requests the issues it closes start after', async () => {
    const { result, acts } = await run(
      {},
      {
        [headed('feature')]: ok([]),
        'POST /repos/o/n/pulls': ok({ number: 9 }),
        'POST /repos/o/n/issues/9/labels': ok([]),
        ...exists(9, 'Closes #10', closes(10)),
        '/repos/o/n/issues/10': ok({
          state: 'open',
          body: 'Start-After: #11',
          repository_url: OWN,
        }),
        '/repos/o/n/issues/10/dependencies/blocked_by?per_page=100': ok([]),
        '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100':
          ok([
            { number: 6, body_html: closes(11) },
            { number: 9, body_html: closes(10) },
          ]),
        'PATCH /repos/o/n/issues/9': ok({}),
      },
    );

    assert.isTrue(Result.isOk(result));

    assert.strictEqual(
      acts.at(-1),
      String.raw`PATCH /issues/9 {"body":"Merge-After: #6\n\nCloses #10"}`,
    );
  });

  test('writes itself into each --merge-before pull request that does not name it', async () => {
    const { result, acts } = await run(
      { mergeBefore: [7, 8] },
      {
        [headed('feature')]: ok([]),
        '/repos/o/n/pulls/7': ok({
          state: 'open',
          body: 'Prose.',
          head: { ref: 'seven' },
        }),
        '/repos/o/n/pulls/8': ok({
          state: 'open',
          body: 'Merge-After: #9',
          head: { ref: 'eight' },
        }),
        'POST /repos/o/n/pulls': ok({ number: 9 }),
        'POST /repos/o/n/issues/9/labels': ok([]),
        ...exists(9, '', ''),
        '/repos/o/n/issues/9': ok({
          body: '',
          repository_url: OWN,
          pull_request: {},
        }),
        'PATCH /repos/o/n/issues/7': ok({}),
        'PATCH /repos/o/n/issues/9': ok({}),
      },
    );

    assert.isTrue(Result.isOk(result));

    // #8 names it already; the note goes in once both do.
    assert.deepStrictEqual(
      acts.filter((act) => act.startsWith('PATCH')),
      [
        String.raw`PATCH /issues/7 {"body":"Merge-After: #9\n\nProse."}`,
        'PATCH /issues/9 {"body":"Merges before #7, #8, whose `Merge-After:` names this one.\\n"}',
      ],
    );
  });

  test('puts the note into one open already, under its Merge-After line', async () => {
    const { result, acts } = await run(
      { mergeBefore: [7] },
      {
        [headed('feature')]: ok([target(9, 'main')]),
        '/repos/o/n/pulls/7': ok({
          state: 'open',
          body: 'Prose.',
          head: { ref: 'seven' },
        }),
        ...exists(9, 'Merge-After: #3\n\nProse.', ''),
        '/repos/o/n/issues/9': ok({
          body: 'Merge-After: #3\n\nProse.',
          repository_url: OWN,
          pull_request: {},
        }),
        'POST /repos/o/n/issues/9/labels': ok([]),
        'PATCH /repos/o/n/issues/7': ok({}),
        'PATCH /repos/o/n/issues/9': ok({}),
      },
    );

    assert.isTrue(Result.isOk(result));

    assert.strictEqual(
      acts.at(-1),
      `${String.raw`PATCH /issues/9 {"body":"Merge-After: #3\nMerges before #7, whose `}\`Merge-After:\`${String.raw` names this one.\n\nProse."}`}`,
    );
  });

  test('writes nothing when the note names in its own order what it would', async () => {
    const body =
      'Merges before #7, #5, whose `Merge-After:` names this one.\n\nProse.';

    const answer = ok({
      state: 'open',
      body: 'Merge-After: #9',
      head: { ref: 'x' },
    });

    const { result, acts } = await run(
      { mergeBefore: [7] },
      {
        [headed('feature')]: ok([target(9, 'main')]),
        '/repos/o/n/pulls/5': answer,
        '/repos/o/n/pulls/7': answer,
        ...exists(9, body, ''),
        '/repos/o/n/issues/9': ok({
          body,
          repository_url: OWN,
          pull_request: {},
        }),
        'POST /repos/o/n/issues/9/labels': ok([]),
      },
    );

    assert.isTrue(Result.isOk(result));

    assert.isFalse(acts.some((act) => act.startsWith('PATCH')));
  });

  test('drops from the note one it now merges after', async () => {
    const body =
      'Merge-After: #5\nMerges before #5, whose `Merge-After:` names this one.\n\nProse.';

    const { result, acts } = await run(
      { mergeBefore: [7] },
      {
        [headed('feature')]: ok([target(9, 'main')]),
        '/repos/o/n/pulls/7': ok({
          state: 'open',
          body: 'Merge-After: #9',
          head: { ref: 'x' },
        }),
        ...exists(9, body, ''),
        '/repos/o/n/issues/9': ok({
          body,
          repository_url: OWN,
          pull_request: {},
        }),
        'POST /repos/o/n/issues/9/labels': ok([]),
        'PATCH /repos/o/n/issues/9': ok({}),
      },
    );

    assert.isTrue(Result.isOk(result));

    expect(acts.at(-1)).toContain('Merges before #7, whose');
  });

  test('refuses, rather than notes, a cycle an edit made while the successors were written', async () => {
    const issue = (body: string): ReturnType<typeof ok> =>
      ok({ body, repository_url: OWN, pull_request: {} });

    const { result } = await run(
      { mergeBefore: [7] },
      {
        [headed('feature')]: ok([target(9, 'main')]),
        '/repos/o/n/pulls/7': ok({
          state: 'open',
          body: '',
          head: { ref: 'x' },
        }),
        ...exists(9, '', ''),
        '/repos/o/n/issues/9': [issue(''), issue('Merge-After: #7')],
        'POST /repos/o/n/issues/9/labels': ok([]),
        'PATCH /repos/o/n/issues/7': ok({}),
      },
    );

    assert.isTrue(Result.isErr(result));

    expect(result.value).toContain('each now waits on the other');
  });

  test('labels one open already when it cannot be listed again after the push', async () => {
    const { result, acts } = await run(
      {},
      {
        [headed('feature')]: [ok([target(9, 'main')]), status(500, 'boom')],
        'POST /repos/o/n/issues/9/labels': ok([]),
        ...exists(9, '', ''),
      },
    );

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(acts, [
      'push feature',
      'POST /issues/9/labels {"labels":["skip-ci"]}',
      'POST /issues/9/labels {"labels":["auto-rebase"]}',
    ]);
  });

  test('stops before any write when the one open already closed during the push', async () => {
    const { result, acts } = await run(
      {},
      { [headed('feature')]: [ok([target(9, 'main')]), ok([])] },
    );

    assert.isTrue(Result.isErr(result));

    expect(result.value).toContain('no longer open');

    assert.deepStrictEqual(acts, ['push feature']);
  });

  test('keeps in the note those it named that still name it, and drops the rest', async () => {
    const body =
      'Merges before #3, #4, #5, #6, whose `Merge-After:` names this one.\n\nProse.';

    const { result, acts } = await run(
      { mergeBefore: [7] },
      {
        [headed('feature')]: ok([target(9, 'main')]),
        // Deleted, or never a pull request.
        '/repos/o/n/pulls/3': status(410, 'Gone'),
        '/repos/o/n/pulls/4': status(404, 'Not Found'),
        '/repos/o/n/pulls/5': ok({
          state: 'open',
          body: 'Merge-After: #9',
          head: { ref: 'five' },
        }),
        // Closed since: the line no longer names it.
        '/repos/o/n/pulls/6': ok({
          state: 'closed',
          body: 'Merge-After: #9',
          head: { ref: 'six' },
        }),
        '/repos/o/n/pulls/7': ok({
          state: 'open',
          body: 'Merge-After: #9',
          head: { ref: 'seven' },
        }),
        ...exists(9, body, ''),
        '/repos/o/n/issues/9': ok({
          body,
          repository_url: OWN,
          pull_request: {},
        }),
        'POST /repos/o/n/issues/9/labels': ok([]),
        'PATCH /repos/o/n/issues/9': ok({}),
      },
    );

    assert.isTrue(Result.isOk(result));

    expect(acts.at(-1)).toContain('Merges before #5, #7, whose');
  });

  test('writes no note when a --merge-before pull request closed before it was written', async () => {
    const { result, acts } = await run(
      { mergeBefore: [7] },
      {
        [headed('feature')]: ok([]),
        '/repos/o/n/pulls/7': [
          ok({ state: 'open', body: '', head: { ref: 'seven' } }),
          ok({ state: 'closed', body: '', head: { ref: 'seven' } }),
        ],
        'POST /repos/o/n/pulls': ok({ number: 9 }),
        'POST /repos/o/n/issues/9/labels': ok([]),
        ...exists(9, '', ''),
        '/repos/o/n/issues/9': ok({
          body: '',
          repository_url: OWN,
          pull_request: {},
        }),
      },
    );

    assert.isTrue(Result.isErr(result));

    expect(result.value).toContain('closed');

    assert.isFalse(acts.some((act) => act.startsWith('PATCH')));
  });

  test('refuses a --merge-before that is closed or the version pull request, before the push', async () => {
    const [closed, version] = await Promise.all([
      run(
        { mergeBefore: [7] },
        {
          [headed('feature')]: ok([]),
          '/repos/o/n/pulls/7': ok({
            state: 'closed',
            body: '',
            head: { ref: 'seven' },
          }),
        },
      ),
      run(
        { mergeBefore: [7] },
        {
          [headed('feature')]: ok([]),
          '/repos/o/n/pulls/7': ok({
            state: 'open',
            body: '',
            head: { ref: 'changeset-release/main' },
          }),
        },
      ),
    ]);

    assert.isTrue(Result.isErr(closed.result));

    assert.isTrue(Result.isErr(version.result));

    expect(version.result.value).toContain('blocks-release');

    assert.deepStrictEqual([...closed.acts, ...version.acts], []);
  });

  test('writes into no --merge-before pull request its own body merges after', async () => {
    const { result, acts } = await run(
      { mergeBefore: [7] },
      {
        [headed('feature')]: ok([target(9, 'main')]),
        '/repos/o/n/pulls/7': ok({
          state: 'open',
          body: '',
          head: { ref: 'seven' },
        }),
        'POST /repos/o/n/issues/9/labels': ok([]),
        ...exists(9, 'Merge-After: #7', ''),
        '/repos/o/n/issues/9': ok({
          body: 'Merge-After: #7',
          repository_url: OWN,
          pull_request: {},
        }),
      },
    );

    assert.isTrue(Result.isErr(result));

    expect(result.value).toContain('would be a cycle');

    assert.isFalse(acts.some((act) => act.startsWith('PATCH')));
  });

  test('says what it would do on a dry run, and does none of it', async () => {
    const { result, acts } = await run(
      { dryRun: true, mergeAfter: [3] },
      { [headed('feature')]: ok([]) },
    );

    assert.isTrue(Result.isOk(result));

    expect(result.value).toContain('declare Merge-After: #3');

    expect(result.value).toContain('"feat: a thing"');

    assert.deepStrictEqual(acts, []);
  });
});
