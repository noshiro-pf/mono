import { createState, getCurrentScope, map, type Scope } from 'synstate';
import { constant, Fragment, render, view, type JSX } from 'synstate-dom';

const mountInto = (
  app: () => JSX.Element,
): Readonly<{
  container: HTMLDivElement;
  unmount: () => void;
}> => {
  const container = document.createElement('div');

  const unmount = render(app, container);

  return { container, unmount };
};

describe(render, () => {
  test('mounts elements and constant text', () => {
    const { container } = mountInto(() => (
      <ul>
        <li>{constant('a')}</li>
        <li>{constant(1)}</li>
      </ul>
    ));

    assert.strictEqual(container.getHTML(), '<ul><li>a</li><li>1</li></ul>');
  });

  test('calls the component once and binds observable text', () => {
    const [count$, setCount] = createState(0);

    const mut_calls = { current: 0 };

    const Counter = (): JSX.Element => {
      mut_calls.current += 1;

      return (
        <p>
          {count$}
          {constant(' / ')}
          {view(count$, (n) => n * 2)}
        </p>
      );
    };

    const { container } = mountInto(Counter);

    assert.strictEqual(container.textContent, '0 / 0');

    setCount(3);

    assert.strictEqual(container.textContent, '3 / 6');

    assert.strictEqual(mut_calls.current, 1);
  });

  test('updates the same text node rather than replacing it', () => {
    const [label$, setLabel] = createState('a');

    const { container } = mountInto(() => <p>{label$}</p>);

    const text = container.querySelector('p')?.firstChild;

    setLabel('b');

    assert.strictEqual(container.querySelector('p')?.firstChild, text);

    assert.strictEqual(text?.textContent, 'b');
  });

  test('a description creates nothing until it is mounted', () => {
    const mut_calls = { current: 0 };

    const Child = (): JSX.Element => {
      mut_calls.current += 1;

      return <span />;
    };

    const description = <Child />;

    assert.strictEqual(mut_calls.current, 0);

    const { container } = mountInto(() => (
      <div>
        {description}
        {description}
      </div>
    ));

    assert.strictEqual(mut_calls.current, 2);

    assert.strictEqual(
      container.getHTML(),
      '<div><span></span><span></span></div>',
    );
  });

  test('passes props to a component, observables included', () => {
    const [name$, setName] = createState('x');

    const Greeting = ({
      name,
    }: Readonly<{ name: typeof name$ }>): JSX.Element => <b>{name}</b>;

    const { container } = mountInto(() => <Greeting name={name$} />);

    assert.strictEqual(container.getHTML(), '<b>x</b>');

    setName('y');

    assert.strictEqual(container.getHTML(), '<b>y</b>');
  });

  test('mounts fragments and nested arrays in order', () => {
    const { container } = mountInto(() => (
      <>
        <i />
        {[[<b />], constant('t')]}
        <Fragment>
          <u />
        </Fragment>
      </>
    ));

    assert.strictEqual(container.getHTML(), '<i></i><b></b>t<u></u>');
  });

  test('calls ref with the element before its children are mounted', () => {
    const mut_seen: { childCount: number | undefined } = {
      childCount: undefined,
    };

    const { container } = mountInto(() => (
      <ul
        ref={(element) => {
          mut_seen.childCount = element.childElementCount;
        }}
      >
        <li />
      </ul>
    ));

    assert.strictEqual(mut_seen.childCount, 0);

    assert.strictEqual(container.querySelectorAll('li').length, 1);
  });

  test('runs the app inside a root scope that unmounting disposes', () => {
    const [count$, setCount] = createState(0);

    const mut_scope: { current: Scope | undefined } = { current: undefined };

    const mut_derivedRuns = { current: 0 };

    const { container, unmount } = mountInto(() => {
      mut_scope.current = getCurrentScope();

      const doubled$ = count$.pipe(
        map((n) => {
          mut_derivedRuns.current += 1;

          return n * 2;
        }),
      );

      return <p>{doubled$}</p>;
    });

    assert.isDefined(mut_scope.current);

    setCount(1);

    assert.strictEqual(container.textContent, '2');

    const runsBeforeUnmount = mut_derivedRuns.current;

    unmount();

    assert.strictEqual(container.getHTML(), '');

    setCount(2);

    assert.strictEqual(mut_derivedRuns.current, runsBeforeUnmount);
  });

  test('a completed observable is written once and not subscribed to', () => {
    const [count$, setCount] = createState(1);

    count$.complete();

    const { container } = mountInto(() => <p>{count$}</p>);

    assert.strictEqual(container.textContent, '1');

    setCount(2);

    assert.strictEqual(container.textContent, '1');
  });
});
