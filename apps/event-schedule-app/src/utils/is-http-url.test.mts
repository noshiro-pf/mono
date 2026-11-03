import { isHttpUrl } from './is-http-url.mjs';

describe('isHttpUrl', () => {
  test('https URL', () => {
    assert.isTrue(isHttpUrl('https://example.com/path?q=1#hash'));
  });

  test('http URL', () => {
    assert.isTrue(isHttpUrl('http://localhost:5173'));
  });

  test('uppercase scheme', () => {
    assert.isTrue(isHttpUrl('HTTPS://EXAMPLE.COM'));
  });

  test('plain word', () => {
    assert.isFalse(isHttpUrl('hello'));
  });

  test('host without scheme', () => {
    assert.isFalse(isHttpUrl('example.com'));
  });

  test('scheme other than http or https', () => {
    assert.isFalse(isHttpUrl('ftp://example.com'));

    assert.isFalse(isHttpUrl('mailto:someone@example.com'));

    assert.isFalse(isHttpUrl('data:text/plain,hello'));

    // eslint-disable-next-line no-script-url
    assert.isFalse(isHttpUrl('javascript://example.com'));
  });

  test('scheme without host', () => {
    assert.isFalse(isHttpUrl('https://'));
  });

  test('long input', () => {
    assert.isFalse(isHttpUrl('a'.repeat(100_000)));

    assert.isTrue(isHttpUrl(`https://example.com/${'a'.repeat(100_000)}`));
  });
});
