import { Result } from 'ts-data-forge';
import { unownedReportMarker } from '../conventions/index.mjs';
import { ok, recordedTransport } from './recorded-transport.mjs';
import { fileUnownedReport, readUnownedReports } from './rest-unowned.mjs';

const contextOf = (
  routes: Parameters<typeof recordedTransport>[0],
): ReturnType<typeof recordedTransport> &
  Readonly<{
    context: Parameters<typeof readUnownedReports>[0];
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

describe(readUnownedReports, () => {
  test('keeps each report marker of the issues, and none of a pull request', async () => {
    const { context } = contextOf({
      '/repos/o/n/issues?state=open&creator=me&per_page=100': ok([
        { number: 40, body: `${unownedReportMarker(5)}\n\nbody` },
        { number: 41, body: null },
        { number: 42, body: 'unrelated' },
        {
          number: 44,
          body: `${unownedReportMarker(7)}\n${unownedReportMarker(8)}`,
        },
        {
          number: 43,
          body: unownedReportMarker(6),
          pull_request: { url: '' },
        },
      ]),
    });

    assert.deepStrictEqual(
      await readUnownedReports(context, 'me'),
      Result.ok([
        { issue: 40, pr: 5 },
        { issue: 44, pr: 7 },
        { issue: 44, pr: 8 },
      ]),
    );
  });
});

describe(fileUnownedReport, () => {
  test('files it labelled priority:A, and answers its number', async () => {
    const { context, sent } = contextOf({
      'POST /repos/o/n/issues': ok({ number: 50, html_url: 'u' }),
    });

    assert.deepStrictEqual(
      await fileUnownedReport(context, { title: 't', body: 'b' }),
      Result.ok(50),
    );

    assert.strictEqual(
      sent[0]?.body,
      JSON.stringify({ title: 't', body: 'b', labels: ['priority:A'] }),
    );
  });
});
