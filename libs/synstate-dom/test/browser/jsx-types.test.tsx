import { createState } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
import { expectType } from 'ts-data-forge';

describe('JSX types', () => {
  test('text children must be Bindable', () => {
    const [count$] = createState(0);

    // @ts-expect-error JSX text is a plain string: write `{constant('big')}`
    const text = <p>big</p>;

    // @ts-expect-error a plain string is written once and never updated
    const plain = <p>{'big'}</p>;

    // @ts-expect-error the snapshot is read once
    const snapshot = <p>{count$.getSnapshot().value}</p>;

    const ok = (
      <p>
        {constant('big')}
        {count$}
      </p>
    );

    expectType<typeof ok, JSX.Element>('=');

    assert.isDefined([text, plain, snapshot, ok]);
  });

  test('ref receives the element type of its tag', () => {
    const input = (
      <input
        ref={(element) => {
          expectType<typeof element, HTMLInputElement>('=');
        }}
      />
    );

    assert.isDefined(input);
  });

  test('unknown tags are rejected', () => {
    // @ts-expect-error not an HTML element
    const unknown = <foo />;

    assert.isDefined(unknown);
  });
});

describe('element props types', () => {
  test('attributes take a Bindable of the property type', () => {
    const [count$] = createState(0);

    // @ts-expect-error a plain value would be written once and never updated
    const plain = <div id="x" />;

    // @ts-expect-error `disabled` is a boolean
    const wrongType = <button disabled={constant('yes')} />;

    // @ts-expect-error not a property of a `div`
    const unknownProp = <div href={constant('/')} />;

    // @ts-expect-error `innerHTML` is not bound
    const inner = <div innerHTML={constant('<b></b>')} />;

    const ok = (
      <input
        value={view(count$, (n) => n.toString())}
        disabled={constant(false)}
        tabIndex={count$}
      />
    );

    assert.isDefined([plain, wrongType, unknownProp, inner, ok]);
  });

  test('class takes a string or an object, never both', () => {
    const [on$] = createState(true);

    // @ts-expect-error a class object takes `Bindable<boolean>` values
    const wrong = <p class={{ a: constant('x') }} />;

    const ok = (
      <>
        <p class={constant('a b')} />
        <p class={{ a: on$, b: constant(false) }} />
      </>
    );

    assert.isDefined([wrong, ok]);
  });

  test('event handlers narrow currentTarget and event', () => {
    const ok = (
      <input
        onInput={(event) => {
          expectType<typeof event.currentTarget, HTMLInputElement>('<=');
        }}
        onKeyDown={(event) => {
          expectType<typeof event.key, string>('<=');
        }}
      />
    );

    const [handler$] = createState(() => {});

    // @ts-expect-error a handler is a function, not an observable
    const observable = <button onClick={handler$} />;

    assert.isDefined([ok, observable]);
  });
});

describe('optional attributes', () => {
  test('an attribute takes an observable of `T | undefined`', () => {
    const [label$] = createState<string | undefined>(undefined);

    const ok = (
      <>
        <div aria-label={label$} data-x={label$} title={label$} />
        <svg>
          <g role={constant('img')} opacity={view(label$, () => undefined)} />
        </svg>
      </>
    );

    // @ts-expect-error `value` is a DOM property, which has no absent state
    const property = <input value={label$} />;

    assert.isDefined([ok, property]);
  });

  test('a form takes its props, its named controls notwithstanding', () => {
    const ok = (
      <form
        id={constant('f')}
        onSubmit={(event) => {
          event.preventDefault();
        }}
      />
    );

    // @ts-expect-error a form has no `href`
    const wrong = <form href={constant('/')} />;

    assert.isDefined([ok, wrong]);
  });
});
