import { mergeOrderSearchOf, mergeOrderSearchTitle } from './search.mjs';
import { DEFAULT_MERGE_ORDER } from './view.mjs';

describe(mergeOrderSearchOf, () => {
  test('asks for the open pull requests by default', () => {
    assert.deepStrictEqual(mergeOrderSearchOf(DEFAULT_MERGE_ORDER), {
      query: 'is:pr is:open',
      unhidden: [],
      unpicked: [],
    });
  });

  test('leaves out labels, priorities and drafts it can', () => {
    assert.strictEqual(
      mergeOrderSearchOf({
        ...DEFAULT_MERGE_ORDER,
        hide: ['queued', 'failing'],
        hidePriority: ['low', 'none'],
        hideDrafts: true,
      }).query,
      'is:pr is:open -label:"merge-queued" -label:"priority:low" label:"priority:high","priority:mid","priority:low" draft:false',
    );
  });

  test('says what it cannot leave out', () => {
    assert.deepStrictEqual(
      mergeOrderSearchOf({ ...DEFAULT_MERGE_ORDER, hide: ['setAside'] })
        .unhidden,
      ['setAside'],
    );
  });

  test('picks a label, and says when the pick is the page’s own reading', () => {
    assert.strictEqual(
      mergeOrderSearchOf({ ...DEFAULT_MERGE_ORDER, only: 'pending' }).query,
      'is:pr is:open label:"pending"',
    );

    assert.deepStrictEqual(
      mergeOrderSearchOf({ ...DEFAULT_MERGE_ORDER, only: 'codeOwner' }),
      { query: 'is:pr is:open', unhidden: [], unpicked: ['codeOwner'] },
    );
  });
});

describe(mergeOrderSearchTitle, () => {
  test('names what GitHub lists beyond the page', () => {
    assert.strictEqual(
      mergeOrderSearchTitle({
        query: '',
        unhidden: ['failing', 'setAside'],
        unpicked: ['codeOwner'],
      }),
      'The open pull requests as the filters leave them, in no merge order. GitHub’s search cannot leave out failing and set aside, so it lists those too. GitHub’s search cannot pick awaiting code owner, so it lists the rest too.',
    );
  });
});
