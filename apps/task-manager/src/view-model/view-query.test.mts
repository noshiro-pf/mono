import { parseViewQuery, withViewQuery } from './view-query.mjs';

describe(parseViewQuery, () => {
  test('reads the screen and the graph’s mode', () => {
    assert.deepStrictEqual(parseViewQuery('?view=dag&mode=arc'), {
      view: 'dag',
      mode: 'arc',
    });

    assert.deepStrictEqual(parseViewQuery('?storage=memory&view=list'), {
      view: 'list',
      mode: undefined,
    });

    assert.deepStrictEqual(parseViewQuery('?storage=memory&mode=tile'), {
      view: 'dag',
      mode: 'tile',
    });
  });

  test('gives the graph for no screen, or one it does not know', () => {
    assert.deepStrictEqual(parseViewQuery(''), {
      view: 'dag',
      mode: undefined,
    });

    assert.deepStrictEqual(parseViewQuery('?view=LIST&mode=arc'), {
      view: 'dag',
      mode: 'arc',
    });
  });

  test('gives no mode for one it does not know', () => {
    assert.deepStrictEqual(parseViewQuery('?view=dag&mode=board'), {
      view: 'dag',
      mode: undefined,
    });
  });
});

describe(withViewQuery, () => {
  test('writes the graph’s mode alone, keeping the other parameters', () => {
    assert.strictEqual(
      withViewQuery('?storage=memory', { view: 'dag', mode: 'tile' }),
      '?storage=memory&mode=tile',
    );

    assert.strictEqual(
      withViewQuery('?mode=dag&storage=memory', {
        view: 'dag',
        mode: 'arc',
      }),
      '?mode=arc&storage=memory',
    );
  });

  test('takes out the graph’s screen, the default, from an older link', () => {
    assert.strictEqual(
      withViewQuery('?view=dag&mode=arc&storage=memory', {
        view: 'dag',
        mode: 'arc',
      }),
      '?mode=arc&storage=memory',
    );
  });

  test('writes the list, and no mode beside it', () => {
    assert.strictEqual(
      withViewQuery('?storage=memory&mode=arc', {
        view: 'list',
        mode: 'arc',
      }),
      '?storage=memory&view=list',
    );

    assert.strictEqual(
      withViewQuery('?view=dag&mode=arc', { view: 'list', mode: 'arc' }),
      '?view=list',
    );
  });

  test('replaces what it does not know', () => {
    assert.strictEqual(
      withViewQuery('?view=board&mode=x', { view: 'dag', mode: 'dag' }),
      '?mode=dag',
    );
  });

  test('leaves a URL that already says it as it is', () => {
    assert.strictEqual(
      withViewQuery('?flag&mode=arc', { view: 'dag', mode: 'arc' }),
      '?flag&mode=arc',
    );

    assert.strictEqual(
      withViewQuery('?flag&view=list', { view: 'list', mode: 'arc' }),
      '?flag&view=list',
    );
  });
});
