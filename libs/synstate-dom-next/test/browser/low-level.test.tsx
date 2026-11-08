import {
  constant,
  isChild,
  mountable,
  mountChild,
  render,
  Switch,
  type Bindable,
  type ClassObject,
  type JSX,
  type StyleObject,
} from 'synstate-dom-next';
import { createState, map, onCleanup, state } from 'synstate-next';
import { expectType } from 'ts-std-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

const mountInto = (
  app: () => JSX.Element,
): readonly [container: HTMLDivElement, unmount: () => void] => {
  const container = document.createElement('div');

  const unmount = render(app, container);

  return [container, unmount];
};

describe(mountable, () => {
  test('mounts the node, or the nodes, that its function returns', () => {
    const [container] = mountInto(() => (
      <p>
        {mountable(() => document.createElement('i'))}
        {mountable(() => [
          document.createTextNode('a'),
          document.createElement('b'),
        ])}
      </p>
    ));

    assert.strictEqual(container.getHTML(), '<p><i></i>a<b></b></p>');
  });

  test('runs in the owner it is mounted in, and again on each mount', () => {
    const mut_log: string[] = [];

    const Counted = mountable(() => {
      mut_log.push('mount');

      onCleanup(() => {
        mut_log.push('cleanup');
      });

      return document.createElement('i');
    });

    const [container, unmount] = mountInto(() => (
      <p>
        {Counted}
        {Counted}
      </p>
    ));

    assert.strictEqual(container.getHTML(), '<p><i></i><i></i></p>');

    unmount();

    assert.deepStrictEqual(mut_log, ['mount', 'mount', 'cleanup', 'cleanup']);
  });

  test('mounts in the namespace it is mounted in', () => {
    const [container] = mountInto(() => (
      <svg>{mountable(() => mountChild(<a href={constant('#x')} />))}</svg>
    ));

    assert.strictEqual(
      container.querySelector('a')?.namespaceURI,
      'http://www.w3.org/2000/svg',
    );
  });
});

describe(mountChild, () => {
  test('returns the nodes of a child, text bound to an observable following it', () => {
    const [n$, setN] = createState(1);

    const [container] = mountInto(() =>
      mountable(() => {
        const time = document.createElement('time');

        time.append(
          ...mountChild([constant('n = '), n$.pipe(map((n) => n.toString()))]),
        );

        return time;
      }),
    );

    assert.strictEqual(container.textContent, 'n = 1');

    setN(2);

    assert.strictEqual(container.textContent, 'n = 2');
  });

  test('appends to a parent, in its namespace', () => {
    const [container] = mountInto(() =>
      mountable(() => {
        const svg = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'svg',
        );

        const foreign = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'foreignObject',
        );

        const nodes = mountChild(<a href={constant('#x')} />, svg);

        svg.append(foreign);

        mountChild(<a href={constant('#y')} />, foreign);

        assert.strictEqual(nodes[0]?.parentNode, svg);

        return svg;
      }),
    );

    const [inSvg, inForeign] = container.querySelectorAll('a');

    assert.strictEqual(inSvg?.namespaceURI, 'http://www.w3.org/2000/svg');

    assert.strictEqual(inForeign?.namespaceURI, 'http://www.w3.org/1999/xhtml');

    assert.strictEqual(inForeign?.parentNode?.nodeName, 'foreignObject');
  });

  test('disposes what a child made before it threw', () => {
    const [n$, setN] = createState(0);

    const mut_keyed: number[] = [];

    const mut_mapped: number[] = [];

    const [container] = mountInto(() =>
      mountable(() => {
        const box = document.createElement('p');

        try {
          mountChild(
            [
              // Made in the mount, so that it is the child's to dispose.
              mountable(() =>
                mountChild(
                  n$.pipe(
                    map((n) => {
                      mut_mapped.push(n);

                      return n.toString();
                    }),
                  ),
                ),
              ),
              <Switch
                value={n$}
                key={(n) => {
                  mut_keyed.push(n);

                  if (n === 0) {
                    throw new RangeError('zero');
                  }

                  return n;
                }}
              >
                {() => <i />}
              </Switch>,
            ],
            box,
          );
        } catch {
          box.append('fallback');
        }

        return box;
      }),
    );

    assert.strictEqual(container.textContent, 'fallback');

    setN(1);

    // Neither the text binding nor the switch is left to follow `n$`.
    assert.strictEqual(container.textContent, 'fallback');

    assert.deepStrictEqual(mut_mapped, [0]);

    assert.deepStrictEqual(mut_keyed, [0]);
  });

  test('warns when called outside every owner', () => {
    vi.stubGlobal('console', { ...console, warn: vi.fn() });

    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    const nodes = mountChild(constant('a'));

    assert.strictEqual(nodes[0]?.textContent, 'a');

    expect(console.warn).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining('outside any owner'),
    );
  });
});

describe(isChild, () => {
  test.each([
    ['a string', 'a'],
    ['a number', 1],
    ['an observable', state('a')],
    ['a description', <i />],
    ['an array of children', ['a', [1, <i />]]],
    // One level deep: an element that is no child mounts as nothing.
    ['an array with a non-child', ['a', {}]],
  ] as const)('%s is one', (_name, value) => {
    assert.isTrue(isChild(value));
  });

  test.each([
    ['undefined', undefined],
    ['null', null],
    ['a boolean', true],
    ['a node', document.createElement('i')],
  ] as const)('%s is not one', (_name, value) => {
    assert.isFalse(isChild(value));
  });
});

describe(Switch, () => {
  type Page = Readonly<{ kind: 'list' | 'item'; id: number }>;

  test('mounts the branch for the key, and replaces it when the key changes', () => {
    const [page$, setPage] = createState<Page>({ kind: 'list', id: 0 });

    const mut_mounts: string[] = [];

    const [container] = mountInto(() => (
      <p>
        <Switch value={page$} key={(page) => page.kind}>
          {(kind, page) => {
            mut_mounts.push(`${kind} ${page.id.toString()}`);

            return kind === 'list' ? (
              <i>{constant('list')}</i>
            ) : (
              <b>{page$.pipe(map((p) => p.id.toString()))}</b>
            );
          }}
        </Switch>
      </p>
    ));

    assert.strictEqual(container.textContent, 'list');

    setPage({ kind: 'item', id: 1 });

    // Same key: the branch stays and follows the value.
    setPage({ kind: 'item', id: 2 });

    assert.strictEqual(container.textContent, '2');

    assert.deepStrictEqual(mut_mounts, ['list 0', 'item 1']);
  });

  test('calls key once for each value, in the drain', () => {
    const [n$, setN] = createState(0);

    const mut_keyed: number[] = [];

    mountInto(() => (
      <p>
        <Switch
          value={n$}
          key={(n) => {
            mut_keyed.push(n);

            return n > 0;
          }}
        >
          {(positive) => (positive ? <i>{constant('+')}</i> : undefined)}
        </Switch>
      </p>
    ));

    setN(1);

    setN(2);

    assert.deepStrictEqual(mut_keyed, [0, 1, 2]);
  });

  test('mounts nothing for a branch that is undefined', () => {
    const [n$, setN] = createState(0);

    const [container] = mountInto(() => (
      <p>
        <Switch value={n$} key={(n) => n > 0}>
          {(positive) => (positive ? <i>{constant('+')}</i> : undefined)}
        </Switch>
      </p>
    ));

    assert.strictEqual(container.textContent, '');

    setN(1);

    assert.strictEqual(container.textContent, '+');
  });

  // The path #3693 added for `If` and `For`, reached here through a key of the
  // application's.
  test('a key that throws drops the branch, fails the switch alone, and the next value mounts again', () => {
    const [n$, setN] = createState(1);

    const [label$, setLabel] = createState('x');

    const mut_seen: number[] = [];

    const [container] = mountInto(() => (
      <p>
        {label$}
        <Switch
          value={n$}
          key={(n) => {
            if (n < 0) {
              throw new RangeError('negative');
            }

            return n % 2;
          }}
        >
          {() => (
            <b>
              {n$.pipe(
                map((n) => {
                  mut_seen.push(n);

                  return n.toString();
                }),
              )}
            </b>
          )}
        </Switch>
      </p>
    ));

    assert.throws(() => {
      setLabel('y');

      setN(-1);
    }, 'negative');

    // The branch went before computing from -1.
    assert.strictEqual(container.textContent, 'y');

    assert.notInclude(mut_seen, -1);

    setN(3);

    assert.strictEqual(container.textContent, 'y3');
  });
});

describe('exported prop types', () => {
  test('ClassObject and StyleObject are the class and style objects', () => {
    expectType<ClassObject, ReadonlyRecord<string, Bindable<boolean>>>('=');

    expectType<
      StyleObject,
      ReadonlyRecord<string, Bindable<string | undefined>>
    >('=');

    const [container] = mountInto(() => {
      const classes: ClassObject = {
        on: constant(true),
        off: constant(false),
      } as const;

      const style: StyleObject = { color: constant('red') } as const;

      return <i class={classes} style={style} />;
    });

    assert.strictEqual(
      container.getHTML(),
      '<i class="on" style="color: red;"></i>',
    );
  });
});
