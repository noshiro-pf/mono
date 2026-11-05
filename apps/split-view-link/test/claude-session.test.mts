import { claudeSessionTrailersOf, claudeSessionUrlOf } from '../src/index.mjs';

const url = 'https://claude.ai/code/session_015ESrbamCgMWqeNyk6SCZcL';

describe(claudeSessionUrlOf, () => {
  test('takes a Claude Code session', () => {
    expect(claudeSessionUrlOf(url)).toBe(url);
  });

  test.each([
    'https://example.com/code/session_0123',
    'https://claude.ai/code/session_0123/../../settings',
    'https://claude.ai.example.com/code/session_0123',
    'https://claude.ai/code/session_',
    'https://claude.ai/code/project/chan_012nPa9H',
    'http://claude.ai/code/session_015uv2Fb',
    `${url}?x=1`,
    ` ${url}`,
    '',
  ])('rejects %s', (address) => {
    assert.isUndefined(claudeSessionUrlOf(address));
  });
});

describe(claudeSessionTrailersOf, () => {
  test('reads a linked trailer, its title kept with brackets inside', () => {
    assert.deepStrictEqual(
      claudeSessionTrailersOf(`Claude-Session: [Fix [a] (b)](${url})`),
      [{ title: 'Fix [a] (b)', url }],
    );
  });

  test('reads a bare URL, in any case and with spaces around', () => {
    assert.deepStrictEqual(
      claudeSessionTrailersOf(`  claude-session :  ${url}  `),
      [{ title: '', url }],
    );
  });

  test('reads every session in order, once each', () => {
    const other = 'https://claude.ai/code/session_01ExctjWVoAKejckW27RYVz5';

    assert.deepStrictEqual(
      claudeSessionTrailersOf(
        [
          `Claude-Session: [First](${url})`,
          `Claude-Session: [Second](${other})`,
          `Claude-Session: ${url}`,
        ].join('\n'),
      ),
      [
        { title: 'First', url },
        { title: 'Second', url: other },
      ],
    );
  });

  test('skips a trailer whose link is not a session, and reads the next', () => {
    assert.deepStrictEqual(
      claudeSessionTrailersOf(
        [
          'Claude-Session: [Elsewhere](https://example.com/code/session_0123)',
          `Claude-Session: [Here](${url})`,
        ].join('\n'),
      ),
      [{ title: 'Here', url }],
    );
  });

  test('ignores a line that does not start with the trailer', () => {
    assert.deepStrictEqual(
      claudeSessionTrailersOf(
        `Continued from ${url}, see Claude-Session there.`,
      ),
      [],
    );
  });
});
