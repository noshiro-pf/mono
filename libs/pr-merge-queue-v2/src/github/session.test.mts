import { ok, recordedTransport, status } from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import { openRepository, openSession, type SessionWorld } from './session.mjs';

const worldOf = (
  routes: Parameters<typeof recordedTransport>[0],
): SessionWorld =>
  ({
    transport: recordedTransport(routes).transport,
    env: { GH_TOKEN: 'token' },
    originUrl: () => Promise.resolve('git@github.com:old/name.git'),
    manifestUrl: () => Promise.resolve(undefined),
    ghAuthToken: () => Promise.resolve(Result.err('no gh')),
  }) as const;

describe(openSession, () => {
  test('names the repository as GitHub does now', async () => {
    const session = Result.unwrapThrow(
      await openSession(
        undefined,
        worldOf({
          '/repos/old/name': ok({
            full_name: 'new/name',
            default_branch: 'main',
          }),
          '/user': ok({ login: 'bot' }),
        }),
      ),
    );

    assert.deepStrictEqual(
      {
        repo: session.repo,
        owner: session.context.owner,
        defaultBranch: session.defaultBranch,
        viewer: session.viewer,
      },
      {
        repo: { owner: 'new', name: 'name' },
        owner: 'new',
        defaultBranch: 'main',
        viewer: 'bot',
      },
    );
  });

  test('refuses when the token is no account', async () => {
    const session = await openSession(
      'o/n',
      worldOf({
        '/repos/o/n': ok({ full_name: 'o/n', default_branch: 'main' }),
        '/user': status(401, 'Bad credentials'),
      }),
    );

    assert.isTrue(Result.isErr(session));
  });
});

describe('openSession, both reads failing', () => {
  test('says the repository first, whose read the account’s does not depend on', async () => {
    const opened = await openSession(
      'o/n',
      worldOf({
        '/repos/o/n': status(404, 'Not Found'),
        '/user': status(401, 'Bad credentials'),
      }),
    );

    assert.isTrue(Result.isErr(opened));

    expect(opened.value).toMatch(/^cannot read the repository \(refused\)/u);
  });
});

describe(openRepository, () => {
  test('opens the repository as GitHub names it, not asking whose the token is', async () => {
    const { transport, sent } = recordedTransport({
      '/repos/o/n': ok({ full_name: 'o/renamed', default_branch: 'trunk' }),
    });

    const opened = await openRepository('o/n', {
      transport,
      env: { GH_TOKEN: 'token' },
      originUrl: () => Promise.resolve(undefined),
      manifestUrl: () => Promise.resolve(undefined),
      ghAuthToken: () => Promise.resolve(Result.err('no gh')),
    });

    assert.deepStrictEqual(
      [
        Result.isOk(opened) && [opened.value.repo, opened.value.defaultBranch],
        sent.map(({ url }) => url),
      ],
      [
        [{ owner: 'o', name: 'renamed' }, 'trunk'],
        ['https://api.github.com/repos/o/n'],
      ],
    );
  });
});
