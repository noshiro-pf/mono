import {
  constant,
  createAfterUpdate,
  listenInScope,
  render,
  type JSX,
} from 'synstate-dom-next';
import { createOwner, source, state } from 'synstate-next';
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

    onTestFinished(render(App, container));

    assert.strictEqual(container.querySelectorAll('p').length, 5);
  });

  test('a handler and a ref take no method of an observable', () => {
    const clicks = source<MouseEvent>();

    const pressed = state<HTMLButtonElement | undefined>(undefined);

    const mut_buttons: HTMLButtonElement[] = [];

    // Typed only: mounted, the ref would throw at once.
    const _passedOnTheirOwn = (): JSX.Element => (
      <div>
        {/* @ts-expect-error emit needs the source as its this */}
        <button onClick={clicks.emit} />
        {/* @ts-expect-error set needs the state as its this */}
        <button ref={pressed.set} />
      </div>
    );

    expectType<typeof _passedOnTheirOwn, () => JSX.Element>('=');

    const App = (): JSX.Element => (
      <div>
        <button
          onClick={(event) => {
            clicks.emit(event);
          }}
          ref={(button) => {
            mut_buttons.push(button);
          }}
        />
      </div>
    );

    onTestFinished(render(App, document.createElement('div')));

    const mut_seen: MouseEvent[] = [];

    onTestFinished(
      clicks.subscribe((event) => {
        mut_seen.push(event);
      }),
    );

    mut_buttons[0]?.click();

    assert.strictEqual(mut_seen.length, 1);
  });

  test("a handler's this is typed unknown, and is the element when it is called", () => {
    type Handler = NonNullable<JSX.IntrinsicElements['input']['onInput']>;

    // `unknown`, or none declared; a handler that needs a `this` of its own is
    // not one, as it would be if none were declared.
    expectType<ThisParameterType<Handler>, unknown>('=');

    expectType<(this: Readonly<{ own: true }>) => void, Handler>('!<=');

    const mut_thisValues: unknown[] = [];

    // A function expression, since an arrow function has no `this` to record.
    const record = function record(this: unknown): void {
      mut_thisValues.push(this);
    };

    const mut_buttons: HTMLButtonElement[] = [];

    const App = (): JSX.Element => (
      <div>
        <button
          onClick={record}
          ref={(button) => {
            mut_buttons.push(button);
          }}
        />
        {/* No `on…` property for this event, so it is listened to. */}
        <button
          onFocusIn={record}
          ref={(button) => {
            mut_buttons.push(button);
          }}
        />
      </div>
    );

    onTestFinished(render(App, document.createElement('div')));

    mut_buttons[0]?.click();

    mut_buttons[1]?.dispatchEvent(new FocusEvent('focusin'));

    assert.strictEqual(mut_thisValues.length, 2);

    assert.strictEqual(mut_thisValues[0], mut_buttons[0]);

    assert.strictEqual(mut_thisValues[1], mut_buttons[1]);
  });

  test('listenInScope and createAfterUpdate take no method of an observable', () => {
    const clicks = source<Event>();

    const count = state(0);

    // Typed only: each would throw when it is called.
    const _givenOnTheirOwn = (): void => {
      // @ts-expect-error emit needs the source as its this
      listenInScope(globalThis, 'click', clicks.emit);

      // @ts-expect-error dispose needs the observable as its this
      createAfterUpdate()(count.dispose);
    };

    expectType<typeof _givenOnTheirOwn, () => void>('=');

    // A function of its own passes.
    const owner = createOwner();

    onTestFinished(() => {
      owner.dispose();
    });

    const mut_received: Event[] = [];

    onTestFinished(
      clicks.subscribe((event) => {
        mut_received.push(event);
      }),
    );

    owner.run(() => {
      listenInScope(globalThis, 'click', (event) => {
        clicks.emit(event);
      });
    });

    globalThis.dispatchEvent(new Event('click'));

    owner.dispose();

    globalThis.dispatchEvent(new Event('click'));

    assert.strictEqual(mut_received.length, 1);
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
