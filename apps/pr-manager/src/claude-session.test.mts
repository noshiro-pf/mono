import dedent from 'dedent';
import { parseClaudeSessions } from './claude-session.mjs';

describe(parseClaudeSessions, () => {
  // The trailer itself is `split-view-link`'s `claudeSessionTrailersOf`, and
  // tested there; what is the PR Manager's own is leaving code blocks out.
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

  test('ignores a trailer inside a fenced code block', () => {
    const body = dedent`
      \`\`\`md
      Claude-Session: [Example](${url})
      \`\`\`
    `;

    assert.deepStrictEqual(parseClaudeSessions(body), []);
  });
});
