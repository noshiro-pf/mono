import { createState } from 'synstate';
import { constant, For, If, Portal, render, type JSX } from 'synstate-dom';
import type { StrictPick } from 'ts-type-forge';

const svgNamespace = 'http://www.w3.org/2000/svg';

const htmlNamespace = 'http://www.w3.org/1999/xhtml';

/** Mounts `app` into a container attached to the document. */
const mountInto = (
  app: () => JSX.Element,
): Readonly<{ container: HTMLDivElement; unmount: () => void }> => {
  const container = document.createElement('div');

  document.body.append(container);

  const unmountApp = render(app, container);

  return {
    container,
    unmount: () => {
      unmountApp();

      container.remove();
    },
  };
};

const select = (
  container: Readonly<StrictPick<ParentNode, 'querySelector'>>,
  selector: string,
): Element => {
  const found = container.querySelector(selector);

  assert.isNotNull(found);

  return found;
};

describe('a, script, style and title take their namespace from the parent (#3941)', () => {
  test('outside an svg they are HTML', () => {
    const { container, unmount } = mountInto(() => (
      <a href={constant('/x')}>{constant('x')}</a>
    ));

    assert.strictEqual(select(container, 'a').namespaceURI, htmlNamespace);

    unmount();
  });

  test('directly inside an svg, and inside a g, they are SVG, and what an a holds is drawn', () => {
    const { container, unmount } = mountInto(() => (
      <svg height={constant(100)} width={constant(100)}>
        <title>{constant('Chart')}</title>
        <g>
          <a href={constant('/x')}>
            <rect height={constant(50)} width={constant(50)} />
          </a>
        </g>
      </svg>
    ));

    assert.strictEqual(select(container, 'title').namespaceURI, svgNamespace);

    const anchor = select(container, 'a');

    assert.strictEqual(anchor.namespaceURI, svgNamespace);

    assert.strictEqual(anchor.getAttribute('href'), '/x');

    const rect = select(container, 'rect');

    assert.isAbove(rect.getBoundingClientRect().width, 0);

    unmount();
  });

  test('tabIndex on an SVG a sets tabindex', () => {
    const { container, unmount } = mountInto(() => (
      <svg>
        <a href={constant('/x')} tabIndex={constant(0)}>
          <rect height={constant(5)} width={constant(5)} />
        </a>
      </svg>
    ));

    const anchor = select(container, 'a');

    assert.strictEqual(anchor.getAttribute('tabindex'), '0');

    assert.isFalse(anchor.hasAttribute('tabIndex'));

    unmount();
  });

  test('inside foreignObject they are HTML again', () => {
    const { container, unmount } = mountInto(() => (
      <svg>
        <foreignObject height={constant(50)} width={constant(50)}>
          <a href={constant('/x')}>{constant('x')}</a>
        </foreignObject>
      </svg>
    ));

    assert.strictEqual(select(container, 'a').namespaceURI, htmlNamespace);

    unmount();
  });

  test('mounted later by If, and added later by For, inside an svg they are SVG', () => {
    const [shown$, setShown] = createState(false);

    const [rows$, setRows] = createState<readonly string[]>([]);

    const { container, unmount } = mountInto(() => (
      <svg>
        <If cond={shown$} then={<title>{constant('late')}</title>} />
        <For items={rows$} key={(row) => row}>
          {(row$) => (
            <a href={row$}>
              <rect height={constant(5)} width={constant(5)} />
            </a>
          )}
        </For>
      </svg>
    ));

    setShown(true);

    setRows(['/a', '/b']);

    assert.strictEqual(select(container, 'title').namespaceURI, svgNamespace);

    assert.deepStrictEqual(
      Array.from(container.querySelectorAll('a'), (a) => a.namespaceURI),
      [svgNamespace, svgNamespace],
    );

    unmount();
  });

  test('in a Portal written inside an svg they take the namespace of where they go', () => {
    const target = document.createElement('div');

    document.body.append(target);

    const { unmount } = mountInto(() => (
      <svg>
        <Portal target={target}>
          <a href={constant('/x')}>{constant('x')}</a>
        </Portal>
      </svg>
    ));

    assert.strictEqual(select(target, 'a').namespaceURI, htmlNamespace);

    unmount();

    target.remove();
  });

  test('rendered into an SVG container they are SVG', () => {
    const svg = document.createElementNS(svgNamespace, 'svg');

    document.body.append(svg);

    const unmount = render(() => <title>{constant('t')}</title>, svg);

    assert.strictEqual(select(svg, 'title').namespaceURI, svgNamespace);

    unmount();

    svg.remove();
  });
});
