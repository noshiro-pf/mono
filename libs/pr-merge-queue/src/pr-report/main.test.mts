import { Result } from 'ts-data-forge';
import {
  checkRoutesAsked,
  FAKE_CHECK_ROUTES,
  FAKE_REPO,
  fakeGitHub,
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
