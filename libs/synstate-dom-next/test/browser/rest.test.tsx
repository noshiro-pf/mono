import {
  constant,
  createAfterUpdate,
  deriveBindable,
  For,
  If,
  isImeKeyDown,
  listenInScope,
  mapBindable,
  MatchOptional,
  MatchResult,
  Portal,
  render,
  toObservable,
  type Bindable,
  type JSX,
} from 'synstate-dom-next';
import {
  createOwner,
  isObservable,
  onCleanup,
  state,
  type InitializedObservable,
} from 'synstate-next';
import { expectType, Optional, Result } from 'ts-std-forge';

const mount = (
  app: () => JSX.Element,
): readonly [container: HTMLDivElement, unmount: () => void] => {
  const container = document.createElement('div');

  document.body.append(container);

  const unmount = render(app, container);

  return [
    container,
    () => {
      unmount();

      container.remove();
    },
  ];
};

const inputAt = (container: Element, index: number): HTMLInputElement => {
  const input = Array.from(container.querySelectorAll('input'))[index];

  if (input === undefined) {
    throw new Error(`no input at ${index}`);
  }

  return input;
};

/** After the tasks queued so far, which the controlled restore is one of. */
const nextTask = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

const svgNamespace = 'http://www.w3.org/2000/svg';

const htmlNamespace = 'http://www.w3.org/1999/xhtml';

describe('SVG', () => {
  test('creates SVG tags in the SVG namespace, with their attributes', () => {
    const r = state(5);

    const [container, unmount] = mount(() => (
      <div>
        <a href={constant('#y')}>{constant('html link')}</a>
        <svg viewBox={constant('0 0 10 10')}>
          <circle cx={constant(5)} cy={constant(5)} r={r}>
            <animate attributeName={constant('r')} dur={constant('1s')} />
          </circle>
          <filter>
            <feGaussianBlur
              in={constant('SourceGraphic')}
              stdDeviation={constant(2)}
            />
          </filter>
          <a href={constant('#x')}>
            <title>{constant('link')}</title>
          </a>
          <foreignObject>
            <p>{constant('html')}</p>
          </foreignObject>
        </svg>
      </div>
    ));

    const svg = container.querySelector('svg');

    const circle = container.querySelector('circle');

    assert.strictEqual(svg?.namespaceURI, svgNamespace);

    assert.strictEqual(circle?.namespaceURI, svgNamespace);

    assert.strictEqual(svg?.getAttribute('viewBox'), '0 0 10 10');

    assert.strictEqual(circle?.getAttribute('r'), '5');

    r.set(3);

    assert.strictEqual(circle?.getAttribute('r'), '3');

    assert.strictEqual(
      container.querySelector('feGaussianBlur')?.getAttribute('stdDeviation'),
      '2',
    );

    // `a` and `title` take the namespace of where they are.
    const [htmlLink, svgLink] = Array.from(container.querySelectorAll('a'));

    assert.strictEqual(htmlLink?.namespaceURI, htmlNamespace);

    assert.strictEqual(svgLink?.namespaceURI, svgNamespace);

    assert.strictEqual(
      container.querySelector('title')?.namespaceURI,
      svgNamespace,
    );

    // Inside a `foreignObject`, it is HTML again.
    assert.strictEqual(
      container.querySelector('p')?.namespaceURI,
      htmlNamespace,
    );

    unmount();
  });

  test('an SVG-only tag is SVG outside an `<svg>` too', () => {
    const [container, unmount] = mount(() => (
      <div>
        <path d={constant('M0 0')} />
      </div>
    ));

    assert.strictEqual(
      container.querySelector('path')?.namespaceURI,
      svgNamespace,
    );

    unmount();
  });

  test('an `<a>` inside an `<svg>` gets every prop as a lower-case attribute', () => {
    const [container, unmount] = mount(() => (
      <svg>
        <a
          draggable={state(false)}
          hreflang={constant('ja')}
          tabIndex={constant(-1)}
        />
      </svg>
    ));

    const link = container.querySelector('a');

    assert.strictEqual(link?.getAttribute('tabindex'), '-1');

    assert.strictEqual(link?.getAttribute('hreflang'), 'ja');

    // `draggable` is a DOM property of an HTML element only.
    assert.strictEqual(link?.getAttribute('draggable'), 'false');

    assert.deepStrictEqual(link?.getAttributeNames().toSorted(), [
      'draggable',
      'hreflang',
      'tabindex',
    ]);

    unmount();
  });

  test('a branch or a row mounted later inside an `<svg>` is SVG too', () => {
    const shown = state(false);

    const items = state<readonly number[]>([]);

    const [container, unmount] = mount(() => (
      <svg>
        <If cond={shown} then={<a>{constant('branch')}</a>} />
        <For items={items} key={(n) => n}>
          {() => <a>{constant('row')}</a>}
        </For>
      </svg>
    ));

    shown.set(true);

    items.set([1]);

    const links = Array.from(container.querySelectorAll('a'));

    assert.strictEqual(links.length, 2);

    for (const link of links) {
      assert.strictEqual(link.namespaceURI, svgNamespace);
    }

    unmount();
  });

  test('takes the namespace of the container or the `Portal` target', () => {
    const svg = document.createElementNS(svgNamespace, 'svg');

    document.body.append(svg);

    const unmount = render(() => <a>{constant('top')}</a>, svg);

    const target = document.createElementNS(svgNamespace, 'g');

    svg.append(target);

    const [, unmountPortal] = mount(() => (
      <Portal target={target}>
        <a>{constant('portal')}</a>
      </Portal>
    ));

    const links = Array.from(svg.querySelectorAll('a'));

    assert.strictEqual(links.length, 2);

    for (const link of links) {
      assert.strictEqual(link.namespaceURI, svgNamespace);
    }

    unmountPortal();

    unmount();

    svg.remove();
  });
});

describe(MatchOptional, () => {
  test('mounts `some` with the inner value while there is one, `none` otherwise', () => {
    const value = state<Optional<number>>(Optional.some(1));

    const mut_cleaned: string[] = [];

    const Some = ({
      n,
    }: Readonly<{ n: InitializedObservable<number> }>): JSX.Element => {
      onCleanup(() => {
        mut_cleaned.push('some');
      });

      return <b>{n}</b>;
    };

    const [container, unmount] = mount(() => (
      <MatchOptional
        none={<i>{constant('none')}</i>}
        some={(n) => <Some n={n} />}
        value={value}
      />
    ));

    assert.strictEqual(
      container.getHTML().replaceAll('<!---->', ''),
      '<b>1</b>',
    );

    // The same branch follows the inner value.
    value.set(Optional.some(2));

    assert.strictEqual(container.textContent, '2');

    assert.deepStrictEqual(mut_cleaned, []);

    value.set(Optional.none);

    assert.strictEqual(container.textContent, 'none');

    assert.deepStrictEqual(mut_cleaned, ['some']);

    value.set(Optional.some(3));

    assert.strictEqual(container.textContent, '3');

    unmount();
  });

  test('mounts nothing for `none` when it is omitted', () => {
    const [container, unmount] = mount(() => (
      <MatchOptional
        some={(n) => <b>{n}</b>}
        value={constant(Optional.none as Optional<number>)}
      />
    ));

    assert.strictEqual(container.textContent, '');

    unmount();
  });
});

describe(MatchResult, () => {
  test('mounts `ok` or `err` with the value or the error', () => {
    const value = state<Result<number, string>>(Result.ok(1));

    const [container, unmount] = mount(() => (
      <MatchResult
        err={(e) => <i>{e}</i>}
        ok={(n) => <b>{n}</b>}
        value={value}
      />
    ));

    assert.strictEqual(container.textContent, '1');

    value.set(Result.ok(2));

    assert.strictEqual(container.textContent, '2');

    value.set(Result.err('failed'));

    assert.strictEqual(container.querySelector('i')?.textContent, 'failed');

    value.set(Result.err('again'));

    assert.strictEqual(container.textContent, 'again');

    unmount();
  });
});

describe(Portal, () => {
  test('mounts its children into the target, and removes them with its owner', () => {
    const target = document.createElement('section');

    document.body.append(target);

    const shown = state(true);

    const label = state('a');

    const [container, unmount] = mount(() => (
      <div>
        <Portal target={target}>
          <b>{label}</b>
        </Portal>
      </div>
    ));

    assert.strictEqual(container.textContent, '');

    assert.strictEqual(target.textContent, 'a');

    label.set('b');

    assert.strictEqual(target.textContent, 'b');

    unmount();

    assert.strictEqual(target.textContent, '');

    target.remove();

    shown.set(false);
  });
});

describe('controlled checked', () => {
  test('a change its owner does not take undoes itself', async () => {
    const checked = state(false);

    const [container, unmount] = mount(() => (
      <input checked={checked} type={constant('checkbox')} />
    ));

    const input = inputAt(container, 0);

    input.click();

    // The user's change, until the restore runs.
    assert.isTrue(input.checked);

    await nextTask();

    assert.isFalse(input.checked);

    checked.set(true);

    assert.isTrue(input.checked);

    unmount();
  });

  test('a change its owner takes stays', async () => {
    const checked = state(false);

    const [container, unmount] = mount(() => (
      <input
        checked={checked}
        onChange={(event) => {
          checked.set(event.currentTarget.checked);
        }}
        type={constant('checkbox')}
      />
    ));

    const input = inputAt(container, 0);

    input.click();

    await nextTask();

    assert.isTrue(input.checked);

    assert.isTrue(checked.value);

    unmount();
  });

  test('checking a radio button restores the bound buttons of its group', async () => {
    const which = state<'a' | 'b'>('a');

    const [container, unmount] = mount(() => (
      <div>
        <input
          checked={mapBindable(which, (w) => w === 'a')}
          name={constant('group')}
          type={constant('radio')}
        />
        <input
          checked={mapBindable(which, (w) => w === 'b')}
          name={constant('group')}
          type={constant('radio')}
        />
      </div>
    ));

    const a = inputAt(container, 0);

    const b = inputAt(container, 1);

    b.click();

    assert.isTrue(b.checked);

    assert.isFalse(a.checked);

    await nextTask();

    assert.isTrue(a.checked);

    assert.isFalse(b.checked);

    unmount();
  });

  test('`indeterminate` is controlled too', async () => {
    const [container, unmount] = mount(() => (
      <input
        checked={constant(false)}
        indeterminate={constant(true)}
        type={constant('checkbox')}
      />
    ));

    const input = inputAt(container, 0);

    assert.isTrue(input.indeterminate);

    input.click();

    assert.isFalse(input.indeterminate);

    await nextTask();

    assert.isTrue(input.indeterminate);

    unmount();
  });
});

describe('bindable helpers', () => {
  test('`mapBindable` maps a constant once and an observable as it changes', () => {
    const c = mapBindable(constant(2), (x) => x * 10);

    expectType<typeof c, Bindable<number>>('=');

    assert.isFalse(isObservable(c));

    assert.strictEqual<unknown>(c, 20);

    const s = state(1);

    const m = mapBindable(s, (x) => x * 10);

    assert.isTrue(isObservable(m));

    const o = toObservable(m);

    s.set(2);

    assert.strictEqual(o.value, 20);
  });

  test('`deriveBindable` is a constant when every input is', () => {
    const c = deriveBindable(
      [constant(1), constant('a')],
      (n, s) => `${s}${n}`,
    );

    assert.strictEqual<unknown>(c, 'a1');

    const count = state(2);

    const d = toObservable(
      deriveBindable([count, constant('b')], (n, t) => `${t}${n}`),
    );

    assert.strictEqual(d.value, 'b2');

    count.set(3);

    assert.strictEqual(d.value, 'b3');
  });

  test('`toObservable` holds a constant', () => {
    const o = toObservable(constant(4));

    expectType<typeof o, InitializedObservable<4>>('=');

    assert.strictEqual(o.value, 4);
  });
});

describe(isImeKeyDown, () => {
  test('is true while composing, and for Safari’s Enter that ends one', () => {
    assert.isTrue(
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- the key code is what it reads
      isImeKeyDown({ isComposing: true, key: 'a', keyCode: 65 }),
    );

    assert.isTrue(
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- the key code is what it reads
      isImeKeyDown({ isComposing: false, key: 'Enter', keyCode: 229 }),
    );

    assert.isFalse(
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- the key code is what it reads
      isImeKeyDown({ isComposing: false, key: 'Enter', keyCode: 13 }),
    );
  });
});

describe(listenInScope, () => {
  test('listens until the current owner is disposed', () => {
    const target = new EventTarget();

    const mut_seen: string[] = [];

    const owner = createOwner();

    owner.run(() => {
      listenInScope(target, 'ping', (event) => {
        mut_seen.push(event.type);
      });
    });

    target.dispatchEvent(new Event('ping'));

    owner.dispose();

    target.dispatchEvent(new Event('ping'));

    assert.deepStrictEqual(mut_seen, ['ping']);
  });
});

describe(createAfterUpdate, () => {
  test('runs work after the update, unless the owner is gone by then', async () => {
    const mut_ran: string[] = [];

    const owner = createOwner();

    const after = owner.run(() => createAfterUpdate());

    after(() => {
      mut_ran.push('first');
    });

    await Promise.resolve();

    after(() => {
      mut_ran.push('second');
    });

    owner.dispose();

    await Promise.resolve();

    assert.deepStrictEqual(mut_ran, ['first']);
  });
});
