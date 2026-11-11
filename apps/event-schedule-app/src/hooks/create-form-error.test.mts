import { createState, map } from 'synstate';
import { Optional } from 'ts-data-forge';
import { createFormError } from './create-form-error.mjs';

describe(createFormError, () => {
  test('shows the error from the first blur or change that leaves the value invalid, until it is valid again', () => {
    const [value$, setValue] = createState('');

    const [errorShown$, touch] = createFormError(
      value$.pipe(map((v) => v === '')),
    );

    const shown = (): boolean => Optional.unwrap(errorShown$.getSnapshot());

    // Invalid from the start, but untouched.
    assert.isFalse(shown());

    touch();

    assert.isTrue(shown());

    setValue('a');

    assert.isFalse(shown());

    // Invalid again without a touch: not shown until the next one.
    setValue('');

    assert.isFalse(shown());

    touch();

    assert.isTrue(shown());
  });

  test('shows nothing for a field touched while valid and then made invalid by something else, such as a reset', () => {
    const [value$, setValue] = createState('');

    const [errorShown$, touch] = createFormError(
      value$.pipe(map((v) => v === '')),
    );

    setValue('Party');

    touch();

    // The form reset to blank.
    setValue('');

    assert.isFalse(Optional.unwrap(errorShown$.getSnapshot()));
  });

  test('follows a validity that changes for another reason, without writing during the update', () => {
    const warn = vi.fn();

    vi.stubGlobal('console', { ...console, warn });

    onTestFinished(() => {
      // cspell:disable-next-line
      vi.unstubAllGlobals();
    });

    // As a name already used by an answer that a refresh then removes.
    const [taken$, setTaken] = createState(true);

    const [errorShown$, touch] = createFormError(taken$);

    touch();

    assert.isTrue(Optional.unwrap(errorShown$.getSnapshot()));

    setTaken(false);

    assert.isFalse(Optional.unwrap(errorShown$.getSnapshot()));

    assert.deepStrictEqual(warn.mock.calls, []);
  });
});
