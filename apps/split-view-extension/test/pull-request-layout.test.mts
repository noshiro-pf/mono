import { pullRequestSplitViewSearch } from 'split-view-link';
import {
  computeGeometry,
  parseLayoutSpec,
  removePaneAt,
  type LayoutNode,
} from '../src/index.mjs';

/**
 * The layout a pull request is opened in — by the PR Manager's links, and by
 * the "⧉ Split view" button `github-view-defaults-extension` puts on GitHub — is
 * `split-view-link`'s; what these check is that this extension lays it out at
 * the widths that layout means.
 */
describe('pullRequestSplitViewSearch, laid out', () => {
  test('holds the diff and the conversation at their widths on a wide window', () => {
    const root = threeColumnRoot();

    for (const width of [1440, 1920, 2560, 3840]) {
      const [diffWidth, conversationWidth, issueWidth] = widthsOf(root, width);

      assert.deepStrictEqual(
        [diffWidth, conversationWidth, issueWidth],
        [737, 577, width - 737 - 577 - 2 * gutter],
      );
    }
  });

  test('gives the right column the width of the conversation when it is closed', () => {
    const root = threeColumnRoot();

    const withoutConversation = removePaneAt(root, 1);

    assert.isDefined(withoutConversation);

    const [diffWidth = 0, conversationWidth = 0, issueWidth = 0] = widthsOf(
      root,
      1920,
    );

    assert.deepStrictEqual(widthsOf(withoutConversation, 1920), [
      diffWidth,
      conversationWidth + gutter + issueWidth,
    ]);
  });
});

const gutter = 6;

/** The tree of the split view a pull request that closes an issue opens. */
const threeColumnRoot = (): LayoutNode => {
  const params = new URLSearchParams(
    pullRequestSplitViewSearch({
      workspace: { id: 'pull-request', name: 'Pull request' },
      pullRequest: {
        number: 2085,
        url: 'https://github.com/noshiro-pf/mono/pull/2085',
      },
      title: undefined,
      issueUrl: 'https://github.com/noshiro-pf/mono/issues/2084',
      sessionUrl: undefined,
    }),
  );

  const root = parseLayoutSpec(params.get('layout') ?? '');

  assert.isDefined(root);

  return root;
};

/** Each pane's width, in pane order, on a page `width` pixels wide. */
const widthsOf = (root: LayoutNode, width: number): readonly number[] =>
  computeGeometry(
    root,
    { left: 0, top: 0, width, height: 800 },
    gutter,
  ).panes.map(({ rect }) => rect.width);
