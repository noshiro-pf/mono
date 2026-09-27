import dedent from 'dedent';
import { parseClaudeSessions } from './claude-session.mjs';

describe(parseClaudeSessions, () => {
  const url = 'https://claude.ai/code/session_015ESrbamCgMWqeNyk6SCZcL';

  test('reads the title and the URL of a `Claude-Session:` trailer', () => {
    const body = dedent`
      Adds a thing.

      Claude-Session: [Support stacked pull requests](${url})
    `;

    assert.deepStrictEqual(parseClaudeSessions(body), [
      { title: 'Support stacked pull requests', url },
    ]);
  });

  test('keeps brackets and parentheses inside the title', () => {
    assert.deepStrictEqual(
      parseClaudeSessions(`Claude-Session: [Fix [a] (b)](${url})`),
      [{ title: 'Fix [a] (b)', url }],
    );
  });

  test('takes a bare URL, with no title', () => {
    assert.deepStrictEqual(parseClaudeSessions(`claude-session:  ${url}  `), [
      { title: '', url },
    ]);
  });

  test('reads every session, in order, once each', () => {
    const other = 'https://claude.ai/code/session_01ExctjWVoAKejckW27RYVz5';

    const body = dedent`
      Claude-Session: [First](${url})
      Claude-Session: [Second](${other})
      Claude-Session: [First, again](${url})
    `;

    assert.deepStrictEqual(parseClaudeSessions(body), [
      { title: 'First', url },
      { title: 'Second', url: other },
    ]);
  });

  test('ignores a trailer inside a fenced code block', () => {
    const body = dedent`
      \`\`\`md
      Claude-Session: [Example](${url})
      \`\`\`
    `;

    assert.deepStrictEqual(parseClaudeSessions(body), []);
  });

  test('ignores a URL that is not a Claude Code session', () => {
    const body = dedent`
      Claude-Session: [Elsewhere](https://example.com/code/session_0123)
      Claude-Session: https://claude.ai/code/session_0123/../../settings
      Claude-Session: [Lookalike](https://claude.ai.example.com/code/session_0123)
    `;

    assert.deepStrictEqual(parseClaudeSessions(body), []);
  });

  test('ignores a sentence that mentions a session', () => {
    assert.deepStrictEqual(
      parseClaudeSessions(`Continued from ${url}, see Claude-Session there.`),
      [],
    );
  });
});
