import { ISSUE_STARTS } from './issues-list-view.mjs';
import { STATUS_FILTERS } from './merge-order-view.mjs';
import { PRIORITIES } from './priority.mjs';
import {
  flagParam,
  namesParam,
  searchOf,
  setFlagParam,
  setNamesParam,
} from './url.mjs';

describe(searchOf, () => {
  test('writes nothing at all for no parameter', () => {
    assert.strictEqual(searchOf(new URLSearchParams()), '');
  });

  test('leaves `/` as a reader types it, and escapes the rest as usual', () => {
    assert.strictEqual(
      searchOf(new URLSearchParams('?repo=owner/name&issues.label=a b')),
      '?repo=owner/name&issues.label=a+b',
    );

    assert.strictEqual(
      searchOf(new URLSearchParams('?repo=owner%2Fname')),
      '?repo=owner/name',
    );
  });
});

describe(namesParam, () => {
  test('reads the names it knows, in their own order, once each', () => {
    assert.deepStrictEqual(namesParam(['a', 'b', 'c'] as const, ['c.x.a.a']), [
      'a',
      'c',
    ]);

    assert.deepStrictEqual(namesParam(['a'] as const, []), []);
  });

  test('reads names repeated as a hand may write them', () => {
    assert.deepStrictEqual(namesParam(['a', 'b', 'c'] as const, ['c', 'a.b']), [
      'a',
      'b',
      'c',
    ]);
  });

  test('every list written with it holds names with no `.` of their own', () => {
    for (const names of [STATUS_FILTERS, PRIORITIES, ISSUE_STARTS]) {
      for (const name of names) {
        assert.notInclude(name, '.');
      }
    }
  });
});

describe(setNamesParam, () => {
  test('writes the names joined with `.`, and none as no parameter', () => {
    const params = new URLSearchParams('?k=x');

    setNamesParam(params, 'k', ['a', 'b']);

    assert.strictEqual(params.toString(), 'k=a.b');

    setNamesParam(params, 'k', []);

    assert.isFalse(params.has('k'));
  });
});

describe(flagParam, () => {
  test('reads `1` as on, and anything else as off', () => {
    assert.isTrue(flagParam(new URLSearchParams('?k=1'), 'k'));

    assert.isFalse(flagParam(new URLSearchParams('?k=true'), 'k'));

    assert.isFalse(flagParam(new URLSearchParams(''), 'k'));
  });

  test('writes on as `1`, and off as no parameter', () => {
    const params = new URLSearchParams();

    setFlagParam(params, 'k', true);

    assert.strictEqual(params.toString(), 'k=1');

    setFlagParam(params, 'k', false);

    assert.strictEqual(params.toString(), '');
  });
});
