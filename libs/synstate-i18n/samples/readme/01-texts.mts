import { state } from 'synstate';
import { i18n } from './i18n.mjs';

if (import.meta.vitest !== undefined) {
  test('README: texts', async () => {
    // embed-sample-code-ignore-above
    const name = state('Alice');

    const count = state(1);

    // Observables of the text in the current locale.
    const title = i18n.t.title();

    const greeting = i18n.t.greeting({ name }); // a parameter may be an observable

    const answers = i18n.t.answers({ count });

    const deadline = i18n.t.deadline.label({ date: '12/1' });

    assert.strictEqual(greeting.value, 'Hello, Alice!');

    assert.strictEqual(answers.value, '1 answer');

    name.set('Bob');

    count.set(3);

    assert.strictEqual(greeting.value, 'Hello, Bob!');

    assert.strictEqual(answers.value, '3 answers');

    // Loads `ja`, then switches every text at once.
    await i18n.setLocale('ja');

    assert.strictEqual(title.value, '日程調整');

    assert.strictEqual(greeting.value, 'こんにちは、Bobさん');

    assert.strictEqual(answers.value, '3 件の回答');

    assert.strictEqual(deadline.value, '12/1 までに回答');

    // A string now, for a toast or `document.title`.
    assert.strictEqual(
      i18n.peek.greeting({ name: 'Carol' }),
      'こんにちは、Carolさん',
    );
    // embed-sample-code-ignore-below

    await i18n.setLocale('en');
  });
}
