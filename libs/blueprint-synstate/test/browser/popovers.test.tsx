// Popover, Tooltip and the submenus of MenuItem beside Blueprint React's, and
// how they behave. They are drawn in a portal, or opened by the pointer, so they
// are compared here rather than among `blueprint-cases.tsx`.
import * as Blueprint from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import {
  Button,
  Dialog,
  Menu,
  MenuItem,
  Popover,
  Tooltip,
  type PopoverPlacement,
} from 'blueprint-synstate';
import { createElement as h, type ReactElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { createState } from 'synstate';
import { constant, If, render, type JSX } from 'synstate-dom';
import { userEvent } from 'vitest/browser';
import { mountBlueprint } from './blueprint-cases.js';
import {
  freezeAnimations,
  mountInto,
  one,
  press,
  settle,
  transitioned,
} from './helpers.mjs';
import { linesAfter, shotAfter, stage } from './stage.mjs';

const ignore = (): void => {};

/** A popover whose target is a small outlined button, as the app's sort one. */
const popoverCase = (
  name: string,
  placement: PopoverPlacement | undefined,
  arrow: boolean,
): Case =>
  [
    name,
    () =>
      h(
        Blueprint.PopoverNext,
        {
          isOpen: true,
          arrow,
          content: h(
            Blueprint.Menu,
            null,
            h(Blueprint.MenuItem, { text: 'By name' }),
            h(Blueprint.MenuItem, { text: 'By date' }),
          ),
          ...(placement === undefined ? {} : { placement }),
        },
        h(Blueprint.Button, {
          icon: 'chevron-down',
          size: 'small',
          variant: 'outlined',
        }),
      ),
    () => (
      <Popover
        arrow={arrow}
        content={
          <Menu>
            <MenuItem text={constant('By name')} />
            <MenuItem text={constant('By date')} />
          </Menu>
        }
        isOpen={constant(true)}
        {...(placement === undefined ? {} : { placement })}
      >
        <Button
          icon={'chevron-down'}
          size={'small'}
          variant={constant('outlined')}
        />
      </Popover>
    ),
    async () => {
      await transitioned();
    },
  ] as const;

type Case = readonly [
  name: string,
  theirs: () => ReactElement,
  ours: () => JSX.Element,
  /** What brings it to the state compared, after it is mounted. */
  open: (host: HTMLElement) => Promise<void>,
];

const cases: readonly Case[] = [
  popoverCase('Popover below, with an arrow', 'bottom', true),
  popoverCase('Popover above, without an arrow', 'top', false),
  popoverCase(
    'Popover below from the start, without an arrow',
    'bottom-start',
    false,
  ),
  popoverCase('Popover where it fits', undefined, true),
  [
    'Popover opened by a click on its target',
    () =>
      h(
        Blueprint.PopoverNext,
        {
          arrow: false,
          placement: 'bottom-start',
          transitionDuration: 50,
          content: h(
            Blueprint.Menu,
            null,
            h(Blueprint.MenuItem, { text: 'Sign out' }),
          ),
        },
        h(Blueprint.Button, { text: 'User', variant: 'minimal' }),
      ),
    () => (
      <Popover
        arrow={false}
        content={
          <Menu>
            <MenuItem text={constant('Sign out')} />
          </Menu>
        }
        placement={'bottom-start'}
        transitionDuration={50}
      >
        <Button text={constant('User')} variant={constant('minimal')} />
      </Popover>
    ),
    async (host) => {
      await userEvent.click(theButtonIn(host));

      await transitioned();
    },
  ],
  [
    'Tooltip shown by hovering over its target',
    () =>
      h(
        Blueprint.Tooltip,
        { content: 'Show Password' },
        h(Blueprint.Button, {
          icon: 'lock',
          intent: 'warning',
          variant: 'minimal',
        }),
      ),
    () => (
      <Tooltip content={constant('Show Password')}>
        <Button
          icon={'lock'}
          intent={'warning'}
          variant={constant('minimal')}
        />
      </Tooltip>
    ),
    async (host) => {
      await userEvent.hover(theButtonIn(host));

      await transitioned();
    },
  ],
  [
    'Submenu shown by hovering over its item',
    () =>
      h(
        Blueprint.Menu,
        null,
        h(
          Blueprint.MenuItem,
          { text: 'Account settings' },
          h(Blueprint.MenuItem, { text: 'Change the name' }),
          h(Blueprint.MenuItem, { text: 'Delete', intent: 'danger' }),
        ),
      ),
    () => (
      <Menu>
        <MenuItem text={constant('Account settings')}>
          <MenuItem text={constant('Change the name')} />
          <MenuItem intent={'danger'} text={constant('Delete')} />
        </MenuItem>
      </Menu>
    ),
    async (host) => {
      const item = host.querySelector(
        ':scope .bp6-submenu .bp6-popover-target',
      );

      assert.instanceOf(item, HTMLElement);

      await userEvent.hover(item);

      await transitioned();
    },
  ],
] as const;

describe('popovers beside Blueprint React', () => {
  test.each(cases)(
    '%s has the same markup',
    async (_name, theirs, ours, open) => {
      const blueprint = await linesAfter(
        (host) =>
          mountBlueprint(
            () => h(Blueprint.OverlaysProvider, null, theirs()),
            host,
          ),
        open,
      );

      const synstate = await linesAfter((host) => render(ours, host), open);

      assert.deepStrictEqual(synstate, blueprint);
    },
  );

  test.each(cases)(
    '%s is drawn the same',
    async (_name, theirs, ours, open) => {
      freezeAnimations();

      const blueprint = await shotAfter(
        (host) =>
          mountBlueprint(
            () => h(Blueprint.OverlaysProvider, null, theirs()),
            host,
          ),
        open,
      );

      const synstate = await shotAfter((host) => render(ours, host), open);

      assert.strictEqual(synstate, blueprint);
    },
  );

  test('leaves the same empty overlay as Blueprint once a dialog has closed', async () => {
    const blueprint = await linesAfter(
      (host) => {
        const root = createRoot(host);

        const draw = (isOpen: boolean): void => {
          flushSync(() => {
            root.render(
              h(
                Blueprint.OverlaysProvider,
                null,
                h(Blueprint.Dialog, { isOpen, onClose: ignore }),
              ),
            );
          });
        };

        draw(true);

        setTimeout(() => {
          draw(false);
        }, 400);

        return () => {
          root.unmount();
        };
      },
      async () => {
        await transitioned(800);
      },
    );

    const [isOpen$, setIsOpen] = createState(true);

    const synstate = await linesAfter(
      (host) => {
        const unmount = render(
          () => <Dialog isOpen={isOpen$}>{[]}</Dialog>,
          host,
        );

        setTimeout(() => {
          setIsOpen(false);
        }, 400);

        return unmount;
      },
      async () => {
        await transitioned(800);
      },
    );

    assert.deepStrictEqual(synstate, blueprint);
  });
});

describe(Dialog, () => {
  test('draws no empty overlay for a moment as it first opens', async () => {
    const mut_empty: Element[] = [];

    const watcher = new MutationObserver((records) => {
      for (const node of records.flatMap((r) => Array.from(r.addedNodes))) {
        // As drawn, in the portal added round it.
        if (node instanceof Element) {
          mut_empty.push(
            ...Array.from(node.querySelectorAll('.bp6-overlay')).filter(
              (overlay) => overlay.childElementCount === 0,
            ),
          );
        }
      }
    });

    watcher.observe(document.body, { childList: true, subtree: true });

    onTestFinished(() => {
      watcher.disconnect();
    });

    const [isOpen$, setIsOpen] = createState(false);

    mounted(() => <Dialog isOpen={isOpen$}>{[]}</Dialog>);

    setIsOpen(true);

    await transitioned();

    assert.deepStrictEqual(mut_empty, []);
  });
});

describe(Popover, () => {
  test('opens and closes by a click on its target, keeping its own state', async () => {
    const { host } = mounted(() => (
      <Popover content={<Menu>{[]}</Menu>}>
        <Button text={constant('Open')} />
      </Popover>
    ));

    const button = theButtonIn(host);

    // Decorated once it is drawn.
    await settle();

    assert.strictEqual(button.getAttribute('aria-expanded'), 'false');

    await userEvent.click(button);

    await transitioned();

    assert.strictEqual(button.getAttribute('aria-expanded'), 'true');

    assert.isTrue(button.classList.contains('bp6-active'));

    assert.isNotNull(document.querySelector('.bp6-popover'));

    await userEvent.click(button);

    await transitioned();

    assert.strictEqual(button.getAttribute('aria-expanded'), 'false');

    assert.isNull(document.querySelector('.bp6-popover'));
  });

  test('asks to close by Escape and by a press outside, as it is told', async () => {
    const mut_closes: string[] = [];

    const [isOpen$, setIsOpen] = createState(true);

    const { host } = mounted(() => (
      <Popover
        content={<Menu>{[]}</Menu>}
        isOpen={isOpen$}
        onClose={(event) => {
          mut_closes.push(event.type);

          setIsOpen(false);
        }}
      >
        <Button text={constant('Open')} />
      </Popover>
    ));

    await transitioned();

    // A press on the target is the target's.
    theButtonIn(host).dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true }),
    );

    assert.deepStrictEqual(mut_closes, []);

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    assert.deepStrictEqual(mut_closes, ['mousedown']);

    setIsOpen(true);

    await transitioned();

    const popover = document.querySelector('.bp6-popover');

    assert.instanceOf(popover, HTMLElement);

    popover.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    assert.deepStrictEqual(mut_closes, ['mousedown', 'keydown']);
  });

  test("a menu item leaves an input method's Enter alone", () => {
    const mut_clicks: string[] = [];

    const { container, unmount } = mountInto(() => (
      <Menu>
        <MenuItem
          text={constant('Sign out')}
          onClick={() => {
            mut_clicks.push('click');
          }}
        />
      </Menu>
    ));

    const item = one(container, '.bp6-menu-item');

    assert.isTrue(press(item, 'Enter', { isComposing: true }));

    assert.isTrue(press(item, 'Enter', { keyCode: 229 }));

    assert.deepStrictEqual(mut_clicks, []);

    assert.isFalse(press(item, 'Enter'));

    assert.deepStrictEqual(mut_clicks, ['click']);

    unmount();
  });

  test('closes as a menu item in it is clicked', async () => {
    const mut_clicks: string[] = [];

    const { host } = mounted(() => (
      <Popover
        content={
          <Menu>
            <MenuItem
              text={constant('Sign out')}
              onClick={() => {
                mut_clicks.push('sign out');
              }}
            />
          </Menu>
        }
      >
        <Button text={constant('User')} />
      </Popover>
    ));

    await userEvent.click(theButtonIn(host));

    await transitioned();

    const item = document.querySelector('.bp6-popover .bp6-menu-item');

    assert.instanceOf(item, HTMLElement);

    await userEvent.click(item);

    await transitioned();

    assert.deepStrictEqual(mut_clicks, ['sign out']);

    assert.isNull(document.querySelector('.bp6-popover'));
  });

  test('leaves alone a `bp6-active` its target put on itself', async () => {
    const { host } = mounted(() => (
      <Popover content={<Menu>{[]}</Menu>}>
        <Button active={constant(true)} text={constant('Open')} />
      </Popover>
    ));

    const button = theButtonIn(host);

    await userEvent.click(button);

    await transitioned();

    await userEvent.click(button);

    await transitioned();

    assert.isNull(document.querySelector('.bp6-popover'));

    assert.isTrue(button.classList.contains('bp6-active'));
  });

  test('decorates an element put in place of its target, and leaves its own `bp6-active`', async () => {
    const [ownActive$, setOwnActive] = createState(false);

    const { host } = mounted(() => (
      <Popover content={<Menu>{[]}</Menu>}>
        <If
          cond={ownActive$}
          else={<Button text={constant('Open')} />}
          then={<Button active={constant(true)} text={constant('Open')} />}
        />
      </Popover>
    ));

    await userEvent.click(theButtonIn(host));

    await transitioned();

    setOwnActive(true);

    await settle();

    const replaced = theButtonIn(host);

    assert.strictEqual(replaced.getAttribute('aria-expanded'), 'true');

    await userEvent.click(replaced);

    await transitioned();

    assert.isNull(document.querySelector('.bp6-popover'));

    assert.strictEqual(replaced.getAttribute('aria-expanded'), 'false');

    assert.isTrue(replaced.classList.contains('bp6-active'));
  });

  test('is not closed by the press that opened it', async () => {
    const mut_closes: string[] = [];

    const [isOpen$, setIsOpen] = createState(false);

    const { host } = mounted(() => (
      <div>
        <Popover
          content={<Menu>{[]}</Menu>}
          isOpen={isOpen$}
          onClose={(event) => {
            mut_closes.push(event.type);

            setIsOpen(false);
          }}
        >
          <Button text={constant('Target')} />
        </Popover>
        <button
          class={constant('opener')}
          onMouseDown={() => {
            setIsOpen(true);
          }}
        >
          {constant('Opener')}
        </button>
      </div>
    ));

    const opener = host.querySelector('.opener');

    assert.instanceOf(opener, HTMLElement);

    await userEvent.click(opener);

    await transitioned();

    assert.deepStrictEqual(mut_closes, []);

    assert.isNotNull(document.querySelector('.bp6-popover'));
  });

  test('closes once, though a leaving check was still to run', async () => {
    const mut_closes: string[] = [];

    const [isOpen$, setIsOpen] = createState(true);

    const { host } = mounted(() => (
      <Popover
        content={<Menu>{[]}</Menu>}
        interactionKind={'hover'}
        isOpen={isOpen$}
        onClose={(event) => {
          mut_closes.push(event.type);

          setIsOpen(false);
        }}
      >
        <Button text={constant('Open')} />
      </Popover>
    ));

    await transitioned();

    const target = host.querySelector('.bp6-popover-target');

    const popover = document.querySelector('.bp6-popover');

    assert.instanceOf(target, HTMLElement);

    assert.instanceOf(popover, HTMLElement);

    target.dispatchEvent(new MouseEvent('mouseleave'));

    popover.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    await transitioned(800);

    assert.deepStrictEqual(mut_closes, ['keydown']);
  });

  test('closes what the pointer left, though its delayed open came after', async () => {
    const { host } = mounted(() => (
      <Popover
        content={<Menu>{[]}</Menu>}
        hoverCloseDelay={0}
        hoverOpenDelay={100}
        interactionKind={'hover'}
      >
        <Button text={constant('Open')} />
      </Popover>
    ));

    const target = host.querySelector('.bp6-popover-target');

    assert.instanceOf(target, HTMLElement);

    // Due as the delayed open is, and ahead of it.
    setTimeout(() => {
      target.dispatchEvent(new MouseEvent('mouseleave'));
    }, 100);

    target.dispatchEvent(new MouseEvent('mouseenter'));

    await transitioned(600);

    assert.isNull(document.querySelector('.bp6-popover'));
  });

  test('still asks to close, as the pointer did, though disabled meanwhile', async () => {
    const mut_closes: string[] = [];

    const [isOpen$, setIsOpen] = createState(true);

    const [disabled$, setDisabled] = createState(false);

    const { host } = mounted(() => (
      <Popover
        content={<Menu>{[]}</Menu>}
        disabled={disabled$}
        interactionKind={'hover'}
        isOpen={isOpen$}
        onClose={(event) => {
          mut_closes.push(event.type);

          setIsOpen(false);
        }}
      >
        <Button text={constant('Open')} />
      </Popover>
    ));

    await transitioned();

    const target = host.querySelector('.bp6-popover-target');

    assert.instanceOf(target, HTMLElement);

    target.dispatchEvent(new MouseEvent('mouseleave'));

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    setDisabled(true);

    await transitioned(600);

    assert.deepStrictEqual(mut_closes, ['mouseleave']);
  });

  test('never opens while disabled', async () => {
    const { host } = mounted(() => (
      <Popover content={<Menu>{[]}</Menu>} disabled={constant(true)}>
        <Button text={constant('Open')} />
      </Popover>
    ));

    await userEvent.click(theButtonIn(host));

    await transitioned();

    assert.isNull(document.querySelector('.bp6-popover'));
  });
});

describe(MenuItem, () => {
  test('titles its text with the whole of it while it is cut short', async () => {
    const [text$, setText] = createState('A label far too long for the menu');

    const { host } = mounted(() => (
      <div style={{ width: constant('120px') }}>
        <Menu>
          <MenuItem text={text$} />
        </Menu>
      </div>
    ));

    await settle();

    const text = host.querySelector('.bp6-text-overflow-ellipsis');

    assert.instanceOf(text, HTMLElement);

    assert.strictEqual(text.title, 'A label far too long for the menu');

    setText('Another label, again too long');

    await settle();

    assert.strictEqual(text.title, 'Another label, again too long');

    setText('Short');

    await settle();

    assert.isFalse(text.hasAttribute('title'));
  });
});

describe(Tooltip, () => {
  test('shows while hovered, hides as the pointer leaves, and never while disabled', async () => {
    const [disabled$, setDisabled] = createState(false);

    const { host } = mounted(() => (
      <div>
        <Tooltip content={constant('Hint')} disabled={disabled$}>
          <Button text={constant('Target')} />
        </Tooltip>
        <Button class={'elsewhere'} text={constant('Elsewhere')} />
      </div>
    ));

    const [target, elsewhere] = Array.from(host.querySelectorAll('button'));

    assert.isDefined(target);

    assert.isDefined(elsewhere);

    await userEvent.hover(target);

    await transitioned();

    assert.strictEqual(
      document.querySelector('.bp6-tooltip')?.textContent,
      'Hint',
    );

    await userEvent.hover(elsewhere);

    await transitioned();

    assert.isNull(document.querySelector('.bp6-tooltip'));

    setDisabled(true);

    await userEvent.hover(target);

    await transitioned();

    assert.isNull(document.querySelector('.bp6-tooltip'));
  });

  test('does not open for a pointer passing over it quicker than its delay', async () => {
    const { host } = mounted(() => (
      <div>
        <Tooltip content={constant('Hint')} hoverOpenDelay={200}>
          <Button text={constant('Target')} />
        </Tooltip>
        <Button text={constant('Elsewhere')} />
      </div>
    ));

    const [target, elsewhere] = Array.from(host.querySelectorAll('button'));

    assert.isDefined(target);

    assert.isDefined(elsewhere);

    await userEvent.hover(target);

    await userEvent.hover(elsewhere);

    await transitioned();

    assert.isNull(document.querySelector('.bp6-tooltip'));
  });

  test('does not open later for a hover cut short by being disabled', async () => {
    const [disabled$, setDisabled] = createState(false);

    const { host } = mounted(() => (
      <Tooltip
        content={constant('Hint')}
        disabled={disabled$}
        hoverOpenDelay={200}
      >
        <Button text={constant('Target')} />
      </Tooltip>
    ));

    await userEvent.hover(theButtonIn(host));

    setDisabled(true);

    await transitioned();

    setDisabled(false);

    await transitioned();

    assert.isNull(document.querySelector('.bp6-tooltip'));
  });

  test('appears the first time it opens, as a lazy one does', async () => {
    const { host } = mounted(() => (
      <Tooltip
        content={constant('Hint')}
        hoverOpenDelay={0}
        transitionDuration={2000}
      >
        <Button text={constant('Target')} />
      </Tooltip>
    ));

    await userEvent.hover(theButtonIn(host));

    await settle();

    assert.isNotNull(
      document.querySelector('.bp6-popover-appear, .bp6-popover-appear-active'),
    );

    assert.isNull(
      document.querySelector('.bp6-popover-enter, .bp6-popover-enter-active'),
    );
  });

  test('hides by Escape, though it has no focus', async () => {
    const { host } = mounted(() => (
      <Tooltip content={constant('Hint')}>
        <Button text={constant('Target')} />
      </Tooltip>
    ));

    await userEvent.hover(theButtonIn(host));

    await transitioned();

    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    await transitioned();

    assert.isNull(document.querySelector('.bp6-tooltip'));
  });
});

const theButtonIn = (host: HTMLElement): HTMLButtonElement => {
  const button = host.querySelector('button');

  assert.isNotNull(button);

  return button;
};

/** Mounts `app` on a stage, and unmounts it when the test finishes. */
const mounted = (app: () => JSX.Element): Readonly<{ host: HTMLElement }> => {
  const host = stage();

  const unmount = render(app, host);

  onTestFinished(() => {
    unmount();

    host.remove();
  });

  return { host };
};
