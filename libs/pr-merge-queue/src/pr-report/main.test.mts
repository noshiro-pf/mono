import { Result } from 'ts-data-forge';
import {
  checkRoutesAsked,
  FAKE_CHECK_ROUTES,
  FAKE_REPO,
  fakeGitHub,
  fakeIssue,
} from '../../test/index.mjs';
import { createClient } from './github.mjs';
import { readReportWith } from './main.mjs';

describe(readReportWith, () => {
  test('with `checks: false` asks for no required context, comparison, check, status or workflow run', async () => {
    const requested = await requestsOf({ checks: false });

    assert.deepStrictEqual(checkRoutesAsked(requested), []);
  });

  // The control for the test above, so that it cannot pass for a route the
  // reader never asks.
  test('reads each of them by default', async () => {
    const requested = await requestsOf({});

    assert.deepStrictEqual(checkRoutesAsked(requested), FAKE_CHECK_ROUTES);
  });

  // The open pull requests are read first, and succeed; a limit spent on a read
  // after them, which takes a refusal as nothing there, fails the report.
  test.each([
    {
      what: "an open issue's blocked-by list",
      issue: { issue_dependencies_summary: { total_blocked_by: 1 } },
      refused: '/issues/5/dependencies/blocked_by',
    },
    {
      what: 'the issue a `Start-After:` names beyond the open lists',
      issue: { body: 'Start-After: #9' },
      refused: '/issues/9',
    },
  ] as const)(
    'fails with the rate-limit error when $what is refused by it',
    async ({ issue, refused }) => {
      const github = await fakeGitHub(({ url }) =>
        url.includes(refused)
          ? {
              status: 403,
              headers: { 'x-ratelimit-remaining': '0' },
              body: { message: 'API rate limit exceeded' },
            }
          : url.includes('/issues?state=open')
            ? { body: [fakeIssue(issue)] }
            : undefined,
      );

      const read = await readReportWith(
        createClient('token', github.baseUrl),
        FAKE_REPO,
        { mergedDays: 1, mergedLimit: 1, issuesLimit: 10, checks: false },
      );

      await github.close();

      assert.isTrue(Result.isErr(read));

      assert.include(read.value, 'The rate limit is spent');
    },
  );
});

/** The path of every request {@link readReportWith} sends with `checks`. */
const requestsOf = async (
  checks: Readonly<{ checks?: boolean }>,
): Promise<readonly string[]> => {
  const github = await fakeGitHub();

  const read = await readReportWith(
    createClient('token', github.baseUrl),
    FAKE_REPO,
    { mergedDays: 1, mergedLimit: 1, issuesLimit: 1, ...checks },
  );

  await github.close();

  assert.isTrue(Result.isOk(read));

  return github.requested;
};
