import { Result } from 'ts-data-forge';
import { ok, recordedTransport } from './recorded-transport.mjs';
import {
  createIssue,
  readDescription,
  readOpenIssueTexts,
  writeDescription,
} from './rest-description.mjs';

const contextOf = (
  routes: Parameters<typeof recordedTransport>[0],
): ReturnType<typeof recordedTransport> &
  Readonly<{
    context: Parameters<typeof readDescription>[0];
  }> => {
  const recorded = recordedTransport(routes);

  return {
    ...recorded,
    context: {
      transport: recorded.transport,
      owner: 'o',
      name: 'n',
      token: 'token',
    },
  };
};

const REPOSITORY = 'https://api.github.com/repos/o/n';

describe(readDescription, () => {
  test("reads a description LF only, and whether it is a pull request's, and refuses one transferred away", async () => {
    const { context } = contextOf({
      '/repos/o/n/issues/5': ok({
        body: 'a\r\nb',
        repository_url: REPOSITORY,
        pull_request: {},
      }),
      '/repos/o/n/issues/6': ok({ body: null, repository_url: REPOSITORY }),
      '/repos/o/n/issues/7': ok({
        body: '',
        repository_url: 'https://api.github.com/repos/o/other',
      }),
    });

    assert.deepStrictEqual(
      await Promise.all([
        readDescription(context, 5),
        readDescription(context, 6),
      ]),
      [
        Result.ok({ body: 'a\nb', kind: 'pull-request' }),
        Result.ok({ body: '', kind: 'issue' }),
      ],
    );

    const transferred = await readDescription(context, 7);

    assert.isTrue(Result.isErr(transferred));

    expect(transferred.value).toMatchObject({
      kind: 'malformed',
      message: "it answers as o/other's: transferred, it is edited there",
    });
  });
});

describe(writeDescription, () => {
  test('patches the body alone', async () => {
    const { context, sent } = contextOf({
      'PATCH /repos/o/n/issues/5': ok({}),
    });

    assert.deepStrictEqual(
      await writeDescription(context, 5, 'text'),
      Result.ok(undefined),
    );

    assert.strictEqual(sent[0]?.body, JSON.stringify({ body: 'text' }));
  });
});

describe(readOpenIssueTexts, () => {
  test('keeps the issues, not the pull requests', async () => {
    const { context } = contextOf({
      '/repos/o/n/issues?state=open&per_page=100': ok([
        { number: 1, title: 't', body: null, html_url: 'u1' },
        {
          number: 2,
          title: 'p',
          body: 'b',
          html_url: 'u2',
          pull_request: {},
        },
      ]),
    });

    assert.deepStrictEqual(
      await readOpenIssueTexts(context),
      Result.ok([{ number: 1, title: 't', body: '', url: 'u1' }]),
    );
  });
});

describe(createIssue, () => {
  test('files it with its labels, and answers its number and URL', async () => {
    const { context, sent } = contextOf({
      'POST /repos/o/n/issues': ok({ number: 9, html_url: 'u9' }),
    });

    assert.deepStrictEqual(
      await createIssue(context, {
        title: 't',
        body: 'b',
        labels: ['priority:B'],
      }),
      Result.ok({ number: 9, url: 'u9' }),
    );

    assert.strictEqual(
      sent[0]?.body,
      JSON.stringify({ title: 't', body: 'b', labels: ['priority:B'] }),
    );
  });
});
