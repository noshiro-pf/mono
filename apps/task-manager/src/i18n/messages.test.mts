import { en } from './messages-en.mjs';
import { ja } from './messages-ja.mjs';
import { m, messagesOf } from './messages.mjs';

describe(messagesOf, () => {
  test('gives each language its text', () => {
    assert.strictEqual(messagesOf('ja'), ja);

    assert.strictEqual(messagesOf('en'), en);
  });

  test('is Japanese outside a browser', () => {
    assert.strictEqual(m, ja);
  });
});

describe('en', () => {
  test('puts the values into its own word order', () => {
    assert.strictEqual(
      en.dependencies.describe('Design', 'after finish', '+2d'),
      'Design, +2d after finish',
    );

    assert.strictEqual(
      ja.dependencies.describe('設計', '完了後', '+2日'),
      '設計 の完了後 +2日',
    );

    assert.strictEqual(en.bulkEdit.tasks(1), '1 task');

    assert.strictEqual(en.bulkEdit.tasks(3), '3 tasks');

    assert.strictEqual(
      [en.duration.days(1), en.duration.hours(2), en.duration.minutes(5)].join(
        en.duration.separator,
      ),
      '1d 2h 5m',
    );
  });
});
