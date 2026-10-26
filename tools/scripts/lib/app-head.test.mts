import dedent from 'dedent';
import { linkTargets, parseAppHead, publicPathOf } from './app-head.mjs';

const indexHtml = dedent`
  <!doctype html>
  <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <meta
        name="description"
        content="A &quot;quoted&quot; word &amp; Can&#x27;t &#39;stop&#39;"
      />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <!-- <link rel="icon" href="/commented-out.png" /> is read too -->
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <meta property="og:title" content="First" />
      <meta property="og:title" content="Second" />
      <title> タスク管理 </title>
    </head>
    <body></body>
  </html>
`;

describe('parseAppHead', () => {
  test('reads lang and title', () => {
    const head = parseAppHead(indexHtml);

    assert.strictEqual(head.lang, 'ja');

    assert.strictEqual(head.title, 'タスク管理');
  });

  test('reads a <meta> spread over several lines and decodes its references', () => {
    const head = parseAppHead(indexHtml);

    assert.strictEqual(
      head.meta.get('description'),
      "A \"quoted\" word & Can't 'stop'",
    );
  });

  test('keys <meta property> like <meta name>, the first of a repeat winning', () => {
    const head = parseAppHead(indexHtml);

    assert.strictEqual(head.meta.get('og:title'), 'First');
  });

  test('reads <link> by rel', () => {
    const head = parseAppHead(indexHtml);

    assert.deepStrictEqual(linkTargets(head, 'apple-touch-icon'), [
      '/apple-touch-icon.png',
    ]);
  });
});

describe('publicPathOf', () => {
  test('takes the leading slash or "./" off a path of the page', () => {
    assert.strictEqual(publicPathOf('/favicon.svg'), 'favicon.svg');

    assert.strictEqual(publicPathOf('./icons/a.png'), 'icons/a.png');

    assert.strictEqual(publicPathOf('icons/a.png'), 'icons/a.png');
  });

  test('is undefined for another site', () => {
    assert.isUndefined(publicPathOf('https://fonts.googleapis.com/css'));

    assert.isUndefined(publicPathOf('//cdn.example.com/a.css'));
  });
});
