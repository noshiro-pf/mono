import {
  asPaneOfFrameQuery,
  asSplitOpenRequest,
  isInSplitView,
  paneIdOfAnswer,
  paneIdOfFrameName,
  splitOpenMenuTitle,
  splitOpenRequest,
  splitOpenSearch,
  workerMessageTag,
} from '../src/index.mjs';

const extensionOrigin = 'chrome-extension://abcdefghijklmnop/';

const splitViewPageUrl = `${extensionOrigin}split.html` as const;

const paramsOf = (
  search: string | undefined,
): readonly (readonly [string, string])[] => {
  const params = new URLSearchParams(search ?? '');

  return Array.from(params, ([key, value]) => [key, value] as const);
};

describe('splitOpenSearch', () => {
  test('puts the link to the right of the page, named after the tab', () => {
    assert.deepStrictEqual(
      paramsOf(
        splitOpenSearch({
          direction: 'right',
          pageUrl: 'https://example.com/a',
          linkUrl: 'https://example.org/b?x=1&y=2#z',
          tabTitle: 'Example',
        }),
      ),
      [
        ['layout', 'rpp'],
        ['url', 'https://example.com/a'],
        ['url', 'https://example.org/b?x=1&y=2#z'],
        ['name', 'Example'],
      ],
    );
  });

  test('stacks the link below the page', () => {
    assert.deepStrictEqual(
      paramsOf(
        splitOpenSearch({
          direction: 'down',
          pageUrl: 'https://example.com/a',
          linkUrl: 'https://example.org/b',
          tabTitle: undefined,
        }),
      ),
      [
        ['layout', 'cpp'],
        ['url', 'https://example.com/a'],
        ['url', 'https://example.org/b'],
      ],
    );
  });

  test('leaves the second pane empty when opened on the page', () => {
    assert.deepStrictEqual(
      paramsOf(
        splitOpenSearch({
          direction: 'right',
          pageUrl: 'http://localhost:5173/',
          linkUrl: undefined,
          tabTitle: undefined,
        }),
      ),
      [
        ['layout', 'rpp'],
        ['url', 'http://localhost:5173/'],
      ],
    );
  });

  test('opens nothing when the page is not a web page', () => {
    assert.isUndefined(
      splitOpenSearch({
        direction: 'right',
        pageUrl: 'file:///home/report.html',
        linkUrl: 'https://example.org/b',
        tabTitle: undefined,
      }),
    );
  });

  test('opens nothing on a link that is not a web page', () => {
    assert.isUndefined(
      splitOpenSearch({
        direction: 'down',
        pageUrl: 'https://example.com/',
        // eslint-disable-next-line no-script-url
        linkUrl: 'javascript:alert(1)',
        tabTitle: undefined,
      }),
    );
  });

  test('opens nothing when neither is a web page', () => {
    assert.isUndefined(
      splitOpenSearch({
        direction: 'right',
        pageUrl: `${extensionOrigin}split.html`,
        linkUrl: 'mailto:someone@example.com',
        tabTitle: undefined,
      }),
    );
  });
});

describe('splitOpenMenuTitle', () => {
  test('is Japanese when the UI is', () => {
    assert.strictEqual(splitOpenMenuTitle('right', 'ja'), '右に分割して開く');

    assert.strictEqual(splitOpenMenuTitle('down', 'ja-JP'), '下に分割して開く');
  });

  test('is English otherwise', () => {
    assert.strictEqual(
      splitOpenMenuTitle('right', 'en-US'),
      'Open in a split to the right',
    );

    assert.strictEqual(
      splitOpenMenuTitle('down', 'de'),
      'Open in a split below',
    );
  });
});

describe('isInSplitView', () => {
  test('is a page of the extension', () => {
    assert.isTrue(
      isInSplitView(`${splitViewPageUrl}?ws=default`, splitViewPageUrl),
    );

    assert.isFalse(isInSplitView('https://example.com/', splitViewPageUrl));

    assert.isFalse(
      isInSplitView(`${extensionOrigin}options.html`, splitViewPageUrl),
    );

    assert.isFalse(isInSplitView(undefined, splitViewPageUrl));
  });
});

describe('splitOpenRequest', () => {
  test('splits the pane as the || button does, with the link in the new pane', () => {
    assert.deepStrictEqual(
      splitOpenRequest({
        direction: 'right',
        tabId: 7,
        paneId: 2,
        linkUrl: 'https://example.org/b',
      }),
      {
        tag: workerMessageTag,
        kind: 'split-open',
        tabId: 7,
        paneId: 2,
        axis: 'row',
        url: 'https://example.org/b',
      },
    );
  });

  test('splits as the = button does, with an empty pane off a link', () => {
    assert.deepStrictEqual(
      splitOpenRequest({
        direction: 'down',
        tabId: 7,
        paneId: undefined,
        linkUrl: undefined,
      }),
      {
        tag: workerMessageTag,
        kind: 'split-open',
        tabId: 7,
        paneId: undefined,
        axis: 'column',
        url: undefined,
      },
    );
  });

  test('asks nothing on a link that is not a web page', () => {
    assert.isUndefined(
      splitOpenRequest({
        direction: 'down',
        tabId: 7,
        paneId: 1,
        linkUrl: 'mailto:someone@example.com',
      }),
    );
  });
});

describe('worker messages', () => {
  test('a request survives being sent', () => {
    const request = splitOpenRequest({
      direction: 'down',
      tabId: 3,
      paneId: 0,
      linkUrl: 'https://example.org/',
    });

    assert.deepStrictEqual(
      asSplitOpenRequest(structuredClone(request)),
      request,
    );
  });

  test('a request with no pane or address keeps them undefined', () => {
    assert.deepStrictEqual(
      asSplitOpenRequest({
        tag: workerMessageTag,
        kind: 'split-open',
        tabId: 3,
        axis: 'row',
      }),
      {
        tag: workerMessageTag,
        kind: 'split-open',
        tabId: 3,
        paneId: undefined,
        axis: 'row',
        url: undefined,
      },
    );
  });

  test('anything else is not a request', () => {
    assert.isUndefined(
      asSplitOpenRequest({
        tag: workerMessageTag,
        kind: 'split-open',
        tabId: 3,
        axis: 'diagonal',
      }),
    );

    assert.isUndefined(
      asSplitOpenRequest({ tag: 'other', kind: 'split-open', tabId: 3 }),
    );
  });

  test('the frame query and its answer', () => {
    assert.isDefined(
      asPaneOfFrameQuery({ tag: workerMessageTag, kind: 'pane-of-frame' }),
    );

    assert.isUndefined(asPaneOfFrameQuery({ kind: 'pane-of-frame' }));

    assert.strictEqual(paneIdOfAnswer(4), 4);

    assert.isUndefined(paneIdOfAnswer(null));

    assert.isUndefined(paneIdOfAnswer(-1));

    assert.isUndefined(paneIdOfAnswer(1.5));
  });

  test('the pane a frame name says', () => {
    assert.strictEqual(paneIdOfFrameName('split-view-pane:12'), 12);

    assert.isUndefined(paneIdOfFrameName('split-view-pane:'));

    assert.isUndefined(paneIdOfFrameName('split-view-pane:1x'));

    assert.isUndefined(paneIdOfFrameName('other'));
  });
});
