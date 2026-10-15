import { parseViewQuery, withViewQuery } from './view-query.mjs';

describe(parseViewQuery, () => {
  test('reads the screen and the graph’s mode', () => {
    assert.deepStrictEqual(parseViewQuery('?view=dag&mode=arc'), {
      view: 'dag',
      mode: 'arc',
    });

    assert.deepStrictEqual(parseViewQuery('?storage=memory&view=dag'), {
      view: 'dag',
      mode: undefined,
    });
  });

  test('gives the list for no screen, or one it does not know', () => {
    assert.deepStrictEqual(parseViewQuery(''), {
      view: 'list',
      mode: undefined,
    });

    assert.deepStrictEqual(parseViewQuery('?view=DAG&mode=arc'), {
      view: 'list',
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
  test('writes the graph’s screen and mode, keeping the other parameters', () => {
    assert.strictEqual(
      withViewQuery('?storage=memory', { view: 'dag', mode: 'tile' }),
      '?storage=memory&view=dag&mode=tile',
    );

    assert.strictEqual(
      withViewQuery('?view=dag&mode=dag&storage=memory', {
        view: 'dag',
        mode: 'arc',
      }),
      '?view=dag&mode=arc&storage=memory',
    );
  });

  test('writes nothing for the list, the default', () => {
    assert.strictEqual(
      withViewQuery('?storage=memory&view=dag&mode=arc', {
        view: 'list',
        mode: 'arc',
      }),
      '?storage=memory',
    );

    assert.strictEqual(
      withViewQuery('?view=dag&mode=arc', { view: 'list', mode: 'arc' }),
      '',
    );
  });

  test('replaces what it does not know', () => {
    assert.strictEqual(
      withViewQuery('?view=board&mode=x', { view: 'list', mode: 'dag' }),
      '',
    );
  });

  test('leaves a URL that already says it as it is', () => {
    assert.strictEqual(
      withViewQuery('?flag&view=dag&mode=arc', { view: 'dag', mode: 'arc' }),
      '?flag&view=dag&mode=arc',
    );

    assert.strictEqual(
      withViewQuery('?flag', { view: 'list', mode: 'arc' }),
      '?flag',
    );
  });
});
