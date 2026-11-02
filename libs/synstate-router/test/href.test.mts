import { externalHref, isHref, type Href } from '../src/index.mjs';

describe(externalHref, () => {
  test('accepts an absolute URL, with any scheme', () => {
    assert.strictEqual(
      externalHref('mailto:a@example.com'),
      'mailto:a@example.com',
    );

    assert.strictEqual(
      externalHref('https://example.com/other-app/'),
      'https://example.com/other-app/',
    );
  });

  test('throws on a path, which is what an Href is', () => {
    assert.throws(
      () => externalHref('/other-app/'),
      'synstate-router: externalHref: /other-app/ is not an absolute URL',
    );
  });
});

describe(isHref, () => {
  test('is true of an Href', () => {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- what `href()` returns, without routes
    assert.isTrue(isHref('/products/?page=2' as Href));
  });

  test('is false of an ExternalHref, even to this origin', () => {
    assert.isFalse(isHref(externalHref('https://example.com/products/')));

    assert.isFalse(isHref(externalHref('mailto:a@example.com')));
  });
});
