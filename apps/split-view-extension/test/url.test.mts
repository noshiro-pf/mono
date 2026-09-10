import { hostnameOf, normalizeAddress } from '../src/index.mjs';

describe('normalizeAddress', () => {
  test('keeps an address that already has a scheme', () => {
    assert.deepStrictEqual(
      normalizeAddress('https://example.com/a?b=c#d'),
      'https://example.com/a?b=c#d',
    );

    assert.deepStrictEqual(
      normalizeAddress('  http://example.com  '),
      'http://example.com',
    );
  });

  test('assumes https for a bare host', () => {
    assert.deepStrictEqual(
      normalizeAddress('example.com'),
      'https://example.com',
    );

    assert.deepStrictEqual(
      normalizeAddress('sub.example.co.jp/path'),
      'https://sub.example.co.jp/path',
    );
  });

  test('reads a host with a port as an address, not as a scheme', () => {
    assert.deepStrictEqual(
      normalizeAddress('example.com:8080/x'),
      'https://example.com:8080/x',
    );
  });

  test('assumes http for a local address', () => {
    assert.deepStrictEqual(
      normalizeAddress('localhost:5173'),
      'http://localhost:5173',
    );

    assert.deepStrictEqual(
      normalizeAddress('127.0.0.1:8080/x'),
      'http://127.0.0.1:8080/x',
    );
  });

  test('searches for anything that is not an address', () => {
    assert.deepStrictEqual(
      normalizeAddress('split view extension'),
      'https://www.google.com/search?q=split+view+extension',
    );

    assert.deepStrictEqual(
      normalizeAddress('例'),
      'https://www.google.com/search?q=%E4%BE%8B',
    );
  });

  test('refuses a scheme that would run script in the pane', () => {
    // Spelled in pieces because a `javascript:` literal is itself a lint error.
    const scriptUrl = ['java', 'script:alert(1)'].join('');

    assert.deepStrictEqual(
      normalizeAddress(scriptUrl),
      'https://www.google.com/search?q=javascript%3Aalert%281%29',
    );

    assert.deepStrictEqual(
      normalizeAddress('DATA:text/html,x'),
      'https://www.google.com/search?q=DATA%3Atext%2Fhtml%2Cx',
    );
  });

  test('is empty for empty input', () => {
    assert.deepStrictEqual(normalizeAddress(' '.repeat(3)), '');
  });
});

describe('hostnameOf', () => {
  test('reads the host of an address', () => {
    assert.deepStrictEqual(hostnameOf('https://example.com/a'), 'example.com');
  });

  test('is undefined for something that is not an address', () => {
    assert.deepStrictEqual(hostnameOf('not an address'), undefined);
  });

  test('is undefined for an address with no host', () => {
    assert.deepStrictEqual(hostnameOf('about:blank'), undefined);
  });
});
