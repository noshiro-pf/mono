import dedent from 'dedent';
import { CLAUDE_SESSION_LINE } from 'pr-report-core';
import { trailerLinePattern } from 'split-view-link';
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

describe('the trailer pr-description guards', () => {
  test('is the line claudeSessionTrailersOf reads, up to its value', () => {
    assert.strictEqual(
      trailerLinePattern.source,
      `${CLAUDE_SESSION_LINE.source}(?<value>[^\\n]*)$`,
    );

    assert.isTrue(trailerLinePattern.ignoreCase);

    assert.isTrue(CLAUDE_SESSION_LINE.ignoreCase);
  });
});
