import { constant, render, type JSX } from 'synstate-dom-next';
import { state } from 'synstate-next';
import { expectType } from 'ts-data-forge';

describe('JSX types', () => {
  test('data slots take a Bindable, not a plain value', () => {
    const name = state('a');

    const App = (): JSX.Element => (
      <div>
        {/* @ts-expect-error a plain string is not a Bindable */}
        <p title="plain" />
        <p title={constant('ok')} />
        <p title={name} />
        {/* @ts-expect-error text must be a Bindable */}
        <p>plain text</p>
        {/* @ts-expect-error a number is not a string attribute */}
        <p title={constant(1)} />
        {/* @ts-expect-error a handler is a function, not an observable */}
        <button onClick={name} />
        <input
          onInput={(event) => {
            // `currentTarget` is the element.
            expectType<typeof event.currentTarget, HTMLInputElement>('<=');
          }}
        />
      </div>
    );

    const container = document.createElement('div');

    render(App, container);

    assert.strictEqual(container.querySelectorAll('p').length, 5);
  });

  test('constant rejects null, undefined and observables', () => {
    // @ts-expect-error `null` is an omitted prop
    constant(null);

    // @ts-expect-error `undefined` is an omitted prop
    constant(undefined);

    // @ts-expect-error an observable would be read once
    constant(state(0));

    assert.isTrue(true);
  });
});
