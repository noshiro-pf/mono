import { externalHref } from '../src/index.mjs';

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
