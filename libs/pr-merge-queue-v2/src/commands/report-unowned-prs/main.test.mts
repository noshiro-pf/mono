import {
  ok,
  recordedTransport,
  status,
  unownedReportMarker,
  writeSetAsideComment,
} from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import {
  HEAD,
  PULL_7,
  routes,
  TIP,
  type Routes,
} from '../../../test/index.mjs';
import { reportUnownedPrs } from './main.mjs';
import type { ReportUnownedPrsOptions } from './options.mjs';

const NOW = Date.parse('2026-11-10T00:00:00Z');

const COMMENTS = '/repos/o/n/issues/7/comments?per_page=100';

const ISSUES = '/repos/o/n/issues?state=open&creator=me&per_page=100';

/** #7 set aside for a reason no owner is defined for, so nobody owns it. */
const UNOWNED: Routes = {
  [COMMENTS]: ok([
    {
      id: 1,
      body: writeSetAsideComment(
        { reason: 'mystery', headSha: HEAD, baseSha: TIP },
        'Set aside.',
      ),
      user: { login: 'me' },
      created_at: '2026-11-09T00:00:00Z',
    },
  ]),
} as const;

const run = async (
  overrides: Routes,
  dryRun = false,
): Promise<
  Readonly<{ result: Result<string, string>; writes: readonly string[] }>
> => {
  const { transport, sent } = recordedTransport({ ...routes, ...overrides });

  const options: ReportUnownedPrsOptions = { dryRun, repo: 'o/n' } as const;

  const result = await reportUnownedPrs(options, {
    transport,
    env: { GH_TOKEN: 'token' },
    originUrl: () => Promise.resolve(undefined),
    manifestUrl: () => Promise.resolve(undefined),
    ghAuthToken: () => Promise.resolve(Result.err('no gh')),
    nowEpochMs: () => NOW,
  });

  return {
    result,
    writes: sent
      .filter(({ method }) => method !== 'GET')
      .map(({ method, url }) => `${method} ${url}`),
  };
};

describe(reportUnownedPrs, () => {
  test('says every pull request is owned, and reads no issue list', async () => {
    const { result, writes } = await run({});

    assert.deepStrictEqual(
      [result, writes],
      [Result.ok('Every queued pull request has an owner.'), []],
    );
  });

  test('files one report for a pull request nobody owns', async () => {
    const { result, writes } = await run({
      ...UNOWNED,
      [ISSUES]: ok([]),
      'POST /repos/o/n/issues': ok({ number: 50, html_url: 'u' }),
    });

    assert.deepStrictEqual(
      [result, writes],
      [
        Result.ok('#7: filed #50.'),
        ['POST https://api.github.com/repos/o/n/issues'],
      ],
    );
  });

  test('does not file one already reported, and files nothing in a dry run', async () => {
    const [reported, dry] = await Promise.all([
      run({
        ...UNOWNED,
        [ISSUES]: ok([{ number: 40, body: unownedReportMarker(7) }]),
      }),
      run({ ...UNOWNED, [ISSUES]: ok([]) }, true),
    ]);

    assert.deepStrictEqual(
      [reported, dry],
      [
        { result: Result.ok('#7: already reported in #40.'), writes: [] },
        {
          result: Result.ok(
            '#7: would file "unblock-prs: #7 is in the queue with no owner".',
          ),
          writes: [],
        },
      ],
    );
  });

  test('fails for a report it could not file, and says what was written', async () => {
    const { result } = await run({
      ...UNOWNED,
      [ISSUES]: ok([]),
      'POST /repos/o/n/issues': status(403, 'Forbidden'),
    });

    assert.isTrue(Result.isErr(result));

    expect(result.value).toMatch(
      /^#7: could not file an issue: cannot write a new issue \(refused\): /u,
    );
  });

  test('fails for a queued owner it could not read, and not for one outside the queue', async () => {
    const [queued, outside, noList] = await Promise.all([
      run({ [COMMENTS]: status(502, 'Bad Gateway') }),
      run({
        [COMMENTS]: status(502, 'Bad Gateway'),
        '/repos/o/n/pulls/7': ok({ ...PULL_7, labels: [] }),
      }),
      run({
        ...UNOWNED,
        [ISSUES]: status(502, 'Bad Gateway'),
        // A second, queued pull request whose owner is unread.
        '/repos/o/n/pulls?state=open&sort=created&direction=asc&per_page=100':
          ok([{ number: 7 }, { number: 8 }]),
        '/repos/o/n/pulls/8': ok({
          ...PULL_7,
          number: 8,
          body: '',
          body_html: '',
          html_url: 'https://github.com/o/n/pull/8',
          head: { ...PULL_7.head, ref: 'feature-8' },
        }),
        '/repos/o/n/activity?ref=refs%2Fheads%2Ffeature-8&activity_type=push&direction=asc&per_page=100':
          ok([]),
        '/repos/o/n/pulls/8/reviews?per_page=100': ok([]),
        '/repos/o/n/pulls/8/files?per_page=100': ok([]),
        '/repos/o/n/issues/8/comments?per_page=100': status(502, 'Bad Gateway'),
      }),
    ]);

    assert.isTrue(Result.isErr(queued.result));

    expect(queued.result.value).toMatch(
      /^#7: whether anyone owns it is not known: cannot read .*\.$/u,
    );

    assert.deepStrictEqual(
      [outside.result, queued.writes, outside.writes],
      [Result.ok('Every queued pull request has an owner.'), [], []],
    );

    assert.isTrue(Result.isErr(noList.result));

    expect(noList.result.value).toMatch(
      /^cannot tell which are reported already, so none is filed: .*\n#8: whether anyone owns it is not known: /u,
    );
  });
});
