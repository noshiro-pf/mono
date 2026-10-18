import { asGroupId } from '../domain/index.mjs';
import {
  isDagFilterEmpty,
  NO_DAG_FILTER,
  parseDagFilterQuery,
  toggled,
  withDagFilterQuery,
} from './dag-filter.mjs';

describe(parseDagFilterQuery, () => {
  test('reads every group and label, an empty one as none', () => {
    assert.deepStrictEqual(
      parseDagFilterQuery('?mode=arc&group=g1&label=ui&group=&label=&group=g1'),
      {
        groups: [asGroupId('g1'), undefined],
        labels: ['ui', undefined],
      },
    );
  });

  test('is no filter for a query that says none', () => {
    assert.deepStrictEqual(parseDagFilterQuery('?mode=arc'), NO_DAG_FILTER);
  });
});

describe(withDagFilterQuery, () => {
  test('writes one parameter per choice, keeping the others', () => {
    assert.strictEqual(
      withDagFilterQuery('?storage=memory&mode=arc', {
        groups: [asGroupId('g1'), undefined],
        labels: ['ui'],
      }),
      '?storage=memory&mode=arc&group=g1&group=&label=ui',
    );
  });

  test('takes the filter out for none', () => {
    assert.strictEqual(
      withDagFilterQuery('?group=g1&label=ui', NO_DAG_FILTER),
      '',
    );
  });

  test('gives `search` back when it says so already', () => {
    const search = '?label=ui&mode=arc&group=g1';

    assert.strictEqual(
      withDagFilterQuery(search, {
        groups: [asGroupId('g1')],
        labels: ['ui'],
      }),
      search,
    );
  });

  test('round-trips a label that needs escaping', () => {
    const filter = { groups: [], labels: ['a&b', 'テスト'] } as const;

    assert.deepStrictEqual(
      parseDagFilterQuery(withDagFilterQuery('', filter)),
      filter,
    );
  });
});

describe(isDagFilterEmpty, () => {
  test('is whether nothing is chosen', () => {
    assert.isTrue(isDagFilterEmpty(NO_DAG_FILTER));

    assert.isFalse(isDagFilterEmpty({ groups: [undefined], labels: [] }));
  });
});

describe(toggled, () => {
  test('takes out a value there, and adds one that is not', () => {
    assert.deepStrictEqual(toggled(['a', undefined], undefined), ['a']);

    assert.deepStrictEqual(toggled(['a'], 'b'), ['a', 'b']);
  });
});
