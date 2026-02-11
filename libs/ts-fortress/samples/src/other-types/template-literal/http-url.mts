import * as t from 'ts-fortress';

type HttpUrl = `http://${string}` | `https://${string}`;

const HttpUrl = t.templateLiteral<HttpUrl>({
  is: (value: unknown): value is HttpUrl =>
    typeof value === 'string' &&
    (value.startsWith('http://') || value.startsWith('https://')) &&
    value.length > 7,
  typeName: 'HttpUrl',
  defaultValue: 'https://example.com' as HttpUrl,
});

assert.isTrue(HttpUrl.is('https://example.com'));

assert.isTrue(HttpUrl.is('http://example.com'));

assert.isFalse(HttpUrl.is('ftp://example.com'));
