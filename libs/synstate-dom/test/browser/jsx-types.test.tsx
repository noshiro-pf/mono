import { createState } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
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
