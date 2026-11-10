import {
  clampZoom,
  formatZoom,
  normalizeAddress,
  originOf,
  stepZoom,
  unframeableOf,
  webPageUrlOf,
} from '../src/index.mjs';

describe('normalizeAddress', () => {
  test.each([
    ['', ''],
    ['  https://a.example/x  ', 'https://a.example/x'],
    ['a.example/path', 'https://a.example/path'],
    ['localhost:5173', 'http://localhost:5173'],
    ['127.0.0.1:8080/x', 'http://127.0.0.1:8080/x'],
    ['about:blank', 'about:blank'],
    ['two words', 'https://www.google.com/search?q=two+words'],
    [
      'data:text/html,x',
      'https://www.google.com/search?q=data%3Atext%2Fhtml%2Cx',
    ],
    ['intranet', 'https://www.google.com/search?q=intranet'],
  ])('%j becomes %j', (input, expected) => {
    expect(normalizeAddress(input)).toBe(expected);
  });
});

describe('address parts', () => {
  test('originOf and webPageUrlOf', () => {
    expect(originOf('https://a.example/x?y')).toBe('https://a.example');

    expect(originOf('about:blank')).toBeUndefined();

    expect(webPageUrlOf('http://a.example/')).toBe('http://a.example/');

    expect(webPageUrlOf('chrome://settings')).toBeUndefined();

    expect(webPageUrlOf(undefined)).toBeUndefined();
  });

  test.each([
    ['chrome://settings', 'browser-page'],
    ['view-source:https://a.example/', 'browser-page'],
    ['chrome-extension://abc/page.html', 'extension-page'],
    ['file:///tmp/a.html', 'local-file'],
    ['ftp://a.example/', 'unsupported-scheme'],
    ['https://chromewebstore.google.com/detail/x', 'web-store'],
    ['https://chrome.google.com/webstore/detail/x', 'web-store'],
    ['https://a.example/', undefined],
    ['', undefined],
  ] as const)('unframeableOf(%j) is %j', (address, expected) => {
    expect(unframeableOf(address)).toBe(expected);
  });
});

describe('zoom', () => {
  test('steps along the ladder and stops at its ends', () => {
    expect(stepZoom(1, 'in')).toBe(1.1);

    expect(stepZoom(1, 'out')).toBe(0.9);

    expect(stepZoom(0.67, 'out')).toBe(0.5);

    expect(stepZoom(0.5, 'out')).toBe(0.5);

    expect(stepZoom(2, 'in')).toBe(2);

    expect(stepZoom(1.75, 'reset')).toBe(1);

    expect(stepZoom(1.05, 'in')).toBe(1.1);
  });

  test('clamps and formats', () => {
    expect(clampZoom(9)).toBe(2);

    expect(clampZoom(0.1)).toBe(0.5);

    expect(clampZoom(Number.NaN)).toBe(1);

    expect(formatZoom(0.67)).toBe('67%');
  });
});
