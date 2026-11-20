import { recipientOf } from './recipient-of.mjs';

describe(recipientOf, () => {
  test('is the verified email of the author when the stored one is it', () => {
    assert.strictEqual(
      recipientOf('author@example.com', 'author@example.com'),
      'author@example.com',
    );
  });

  test('ignores case, as Firebase Auth does', () => {
    assert.strictEqual(
      recipientOf('Author@Example.com', 'author@example.com'),
      'author@example.com',
    );
  });

  test('is no one when the stored email is not the author’s verified one', () => {
    assert.strictEqual(
      recipientOf('other@example.com', 'author@example.com'),
      '',
    );
  });

  test('is no one when the author has no verified email', () => {
    assert.strictEqual(recipientOf('author@example.com', undefined), '');
  });

  test('is no one when nothing is stored', () => {
    assert.strictEqual(recipientOf('', 'author@example.com'), '');
  });
});
