import { isRecord, Json, Result } from 'ts-data-forge';
import { postToDiscord } from './discord-webhook.mjs';

describe(postToDiscord, () => {
  test('posts the text in a code block, mentioning no one', async () => {
    const { fetchFn, requests } = recordingFetch(200);

    await postToDiscord(
      {
        webhookUrl: 'https://discord.test/hook',
        title: 'Report',
        text: 'boom',
      },
      fetchFn,
    );

    assert.strictEqual(requests.length, 1);

    assert.strictEqual(requests[0]?.url, 'https://discord.test/hook');

    assert.strictEqual(requests[0]?.method, 'POST');

    assert.deepStrictEqual(requests[0]?.body, {
      content: 'Report\n```text\nboom\n```',
      // An error text can hold `@everyone`.
      allowed_mentions: { parse: [] },
    });
  });

  test('cuts a long text to what one message holds', async () => {
    const { fetchFn, requests } = recordingFetch(200);

    await postToDiscord(
      {
        webhookUrl: 'https://discord.test/hook',
        title: 'Report',
        text: 'x'.repeat(5000),
      },
      fetchFn,
    );

    const content = contentOf(requests[0]?.body);

    assert.isAtMost(content.length, 2000);

    assert.match(content, /^Report\n```text\nx+…\n```$/u);
  });

  test('does not cut a character in half', async () => {
    const { fetchFn, requests } = recordingFetch(200);

    await postToDiscord(
      {
        webhookUrl: 'https://discord.test/hook',
        title: 'Report',
        text: '😀'.repeat(2000),
      },
      fetchFn,
    );

    assert.isTrue(contentOf(requests[0]?.body).isWellFormed());
  });

  test('gives up on a Discord that does not answer', async () => {
    const { fetchFn, requests } = recordingFetch(200);

    await postToDiscord(
      { webhookUrl: 'https://discord.test/hook', title: 'Report', text: 'x' },
      fetchFn,
    );

    assert.isTrue(requests[0]?.hasSignal === true);
  });

  test('keeps a fence in the text from closing the code block', async () => {
    const { fetchFn, requests } = recordingFetch(200);

    await postToDiscord(
      {
        webhookUrl: 'https://discord.test/hook',
        title: 'Report',
        text: 'a```b',
      },
      fetchFn,
    );

    const content = contentOf(requests[0]?.body);

    // The opening and the closing fence, and no other.
    assert.strictEqual(content.split('```').length, 3);
  });

  test('rejects when Discord answers with an error', async () => {
    const { fetchFn } = recordingFetch(404);

    await expect(
      postToDiscord(
        { webhookUrl: 'https://discord.test/hook', title: 'Report', text: 'x' },
        fetchFn,
      ),
    ).rejects.toThrow('404');
  });
});

type RecordedRequest = Readonly<{
  url: string;
  method: string | undefined;
  body: unknown;
  hasSignal: boolean;
}>;

/** A `fetch` answering every request with `status`, and the requests it got. */
const recordingFetch = (
  status: number,
): Readonly<{
  fetchFn: typeof fetch;
  requests: readonly RecordedRequest[];
}> => {
  const mut_requests: RecordedRequest[] = [];

  const fetchFn: typeof fetch = (input, init) => {
    mut_requests.push({
      url:
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url,
      method: init?.method,
      body:
        typeof init?.body === 'string'
          ? Result.unwrapThrow(Json.parse(init.body))
          : undefined,
      hasSignal: init?.signal instanceof AbortSignal,
    });

    return Promise.resolve(new Response(null, { status }));
  };

  return { fetchFn, requests: mut_requests };
};

const contentOf = (body: unknown): string =>
  isRecord(body) && typeof body['content'] === 'string' ? body['content'] : '';
