import { Arr } from 'ts-data-forge';

/**
 * Runs the README samples, which mount into `document.body` when imported, and
 * checks that they do what the README says they do.
 */
describe('README samples', () => {
  test('01-counter unmounts everything it mounted', async () => {
    document.body.replaceChildren();

    await import('../../samples/readme/01-counter.js');

    assert.strictEqual(document.body.getHTML(), '');
  });

  test('02-todo-list adds, toggles and counts', async () => {
    document.body.replaceChildren();

    await import('../../samples/readme/02-todo-list.js');

    assert.deepStrictEqual(textsOf('p'), ['Nothing to do.', '0 remaining']);

    const mut_input = document.body.querySelector('input');

    const add = document.body.querySelector('button');

    assert.isNotNull(mut_input);

    assert.isNotNull(add);

    for (const title of ['milk', 'eggs']) {
      mut_input.value = title;

      mut_input.dispatchEvent(new Event('input'));

      add.click();
    }

    assert.strictEqual(mut_input.value, '');

    assert.deepStrictEqual(textsOf('li'), ['1. milk', '2. eggs']);

    const rows = Array.from(document.body.querySelectorAll('li'));

    assert.isTrue(Arr.isNonEmpty(rows));

    if (!Arr.isNonEmpty(rows)) {
      return;
    }

    rows[0].querySelector('input')?.click();

    assert.isTrue(rows[0].classList.contains('done'));

    assert.deepStrictEqual(textsOf('p'), ['1 remaining']);
  });

  test('03-bindable-props binds observables and constants alike', async () => {
    document.body.replaceChildren();

    await import('../../samples/readme/03-bindable-props.js');

    assert.deepStrictEqual(textsOf('span'), ['Inbox (3)', 'Archive (99+)']);

    document.body.querySelector('button')?.click();

    assert.deepStrictEqual(textsOf('span'), ['Inbox (0)', 'Archive (99+)']);
  });
});

const textsOf = (selector: string): readonly string[] =>
  Array.from(document.body.querySelectorAll(selector), (e) => e.textContent);
