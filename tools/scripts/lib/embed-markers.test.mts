import { Result } from 'ts-data-forge';
import { embedInto, markerKeys, stripMarkers } from './embed-markers.mjs';

const markdown =
  'Takes <!-- benchmark:worst/a -->1.5<!-- /benchmark -->×, <!-- bundle-size:core -->3 kB<!-- /bundle-size -->.';

const mdx =
  'Takes {/* benchmark:worst/a */}1.5{/* /benchmark */}× and {/* benchmark:placement/behind */}behind B{/* /benchmark */}.';

describe(markerKeys, () => {
  test('reads the keys of one marker name, in both spellings', () => {
    assert.deepStrictEqual(Array.from(markerKeys(markdown, 'benchmark')), [
      'worst/a',
    ]);

    assert.deepStrictEqual(Array.from(markerKeys(mdx, 'benchmark')), [
      'worst/a',
      'placement/behind',
    ]);

    assert.deepStrictEqual(Array.from(markerKeys(markdown, 'bundle-size')), [
      'core',
    ]);
  });
});

describe(stripMarkers, () => {
  test('removes the spans of one marker name, content included', () => {
    assert.strictEqual(
      stripMarkers(markdown, 'benchmark'),
      'Takes ×, <!-- bundle-size:core -->3 kB<!-- /bundle-size -->.',
    );

    assert.strictEqual(stripMarkers(mdx, 'benchmark'), 'Takes × and .');
  });
});

describe(embedInto, () => {
  test('replaces the content of every span', () => {
    assert.deepStrictEqual(
      embedInto(mdx, 'benchmark', {
        'worst/a': { text: '2.0', block: false },
        'placement/behind': { text: 'behind C', block: false },
      }),
      Result.ok(
        'Takes {/* benchmark:worst/a */}2.0{/* /benchmark */}× and {/* benchmark:placement/behind */}behind C{/* /benchmark */}.',
      ),
    );
  });

  test('leaves a marker with no value as it is when asked to keep it', () => {
    assert.deepStrictEqual(
      embedInto(
        mdx,
        'benchmark',
        { 'worst/a': { text: '2.0', block: false } },
        'keep',
      ),
      Result.ok(
        'Takes {/* benchmark:worst/a */}2.0{/* /benchmark */}× and {/* benchmark:placement/behind */}behind B{/* /benchmark */}.',
      ),
    );
  });

  test('rejects a marker with no value, and a value with no marker', () => {
    assert.isTrue(Result.isErr(embedInto(mdx, 'benchmark', {})));

    assert.isTrue(
      Result.isErr(
        embedInto(markdown, 'benchmark', {
          'worst/a': { text: '2.0', block: false },
          'worst/b': { text: '3.0', block: false },
        }),
      ),
    );
  });
});
