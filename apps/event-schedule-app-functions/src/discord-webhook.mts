/**
 * Posts `text` under `title` to a Discord channel through its webhook, as a
 * code block, so that a stack keeps its lines and nothing in it is read as
 * markdown, and mentioning no one, so that an `@everyone` in it pings nobody.
 * A text too long for one message is cut. Rejects when Discord answers with an
 * error.
 *
 * @link https://discord.com/developers/docs/resources/webhook#execute-webhook
 */
export const postToDiscord = async (
  {
    webhookUrl,
    title,
    text,
  }: Readonly<{ webhookUrl: string; title: string; text: string }>,
  fetchFn: typeof fetch = fetch,
): Promise<void> => {
  const opening = `${title}\n\`\`\`text\n` as const;

  const closing = '\n```';

  const room = maxContentLength - opening.length - closing.length;

  // A fence in the text would close the block early; a zero-width space between
  // its backticks keeps it from being one.
  const escaped = text.replaceAll('```', '`\u{200B}`\u{200B}`');

  const body =
    escaped.length <= room
      ? escaped
      : (`${withoutTrailingHalf(escaped.slice(0, room - 1))}…` as const);

  const res = await fetchFn(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `${opening}${body}${closing}`,
      allowed_mentions: { parse: [] },
    }),
    // So that a Discord that does not answer does not hold the mail's answer to
    // the client until the function times out.
    signal: AbortSignal.timeout(timeoutMilliseconds),
  });

  if (!res.ok) {
    throw new Error(`The Discord webhook answered ${res.status}.`);
  }
};

/** What Discord accepts in a message's `content`. */
const maxContentLength = 2000;

const timeoutMilliseconds = 10_000;

/** `s` without a lone high surrogate at its end, which a cut can leave. */
const withoutTrailingHalf = (s: string): string =>
  /[\uD800-\uDBFF]$/u.test(s) ? s.slice(0, -1) : s;
