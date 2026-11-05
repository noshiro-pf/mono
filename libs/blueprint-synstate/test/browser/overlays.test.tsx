// Dialog and Alert beside Blueprint React's, and how they behave. They are
// drawn in a portal at the end of the body, not where they are written, so they
// are compared here rather than among `blueprint-cases.tsx`.
import * as Blueprint from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import {
  Alert,
  DateInput,
  DateRangeInput,
  Dialog,
  InputGroup,
} from 'blueprint-synstate';
import { createElement as h, type ReactElement } from 'react';
import { createState } from 'synstate';
import { constant, render, type JSX } from 'synstate-dom';
import { range } from 'ts-data-forge';
import { page, userEvent } from 'vitest/browser';
import { disabledButtonTabIndex, mountBlueprint } from './blueprint-cases.js';
import { freezeAnimations, nextFrame, transitioned } from './helpers.mjs';
import { linesOf } from './markup-lines.mjs';

const ignore = (): void => {};

const cases: readonly (readonly [
  name: string,
  theirs: () => ReactElement,
  ours: () => JSX.Element,
])[] = [
  [
    'Dialog with a header',
    () =>
      h(
        Blueprint.Dialog,
        { isOpen: true, title: 'Settings', icon: 'key', onClose: ignore },
        h('div', { className: 'bp6-dialog-body' }, 'Body'),
        h('div', { className: 'bp6-dialog-footer' }, 'Footer'),
      ),
    () => (
      <Dialog icon={'key'} isOpen={constant(true)} title={constant('Settings')}>
        <div class={constant('bp6-dialog-body')}>{constant('Body')}</div>
        <div class={constant('bp6-dialog-footer')}>{constant('Footer')}</div>
      </Dialog>
    ),
  ],
  [
    'Dialog with a header and no close button',
    () =>
      h(
        Blueprint.Dialog,
        {
          isOpen: true,
          title: 'Created',
          icon: 'timeline-events',
          isCloseButtonShown: false,
        },
        h('div', { className: 'bp6-dialog-body' }, 'Body'),
      ),
    () => (
      <Dialog
        icon={'timeline-events'}
        isCloseButtonShown={false}
        isOpen={constant(true)}
        title={constant('Created')}
      >
        <div class={constant('bp6-dialog-body')}>{constant('Body')}</div>
      </Dialog>
    ),
  ],
  [
    'Dialog with no header',
    () =>
      h(
        Blueprint.Dialog,
        { isOpen: true, onClose: ignore },
        h('div', { className: 'bp6-dialog-body' }, 'Body'),
      ),
    () => (
      <Dialog isOpen={constant(true)}>
        <div class={constant('bp6-dialog-body')}>{constant('Body')}</div>
      </Dialog>
    ),
  ],
  [
    'Alert with an icon and a cancel button',
    () =>
      h(
        Blueprint.Alert,
        {
          isOpen: true,
          icon: 'trash',
          intent: 'danger',
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Delete',
          onCancel: ignore,
          onConfirm: ignore,
        },
        h('p', null, 'Delete every answer?'),
      ),
    () => (
      <Alert
        cancelButtonText={constant('Cancel')}
        confirmButtonText={constant('Delete')}
        icon={'trash'}
        intent={'danger'}
        isOpen={constant(true)}
      >
        <p>{constant('Delete every answer?')}</p>
      </Alert>
    ),
  ],
  [
    'Alert, loading',
    () =>
      h(
        Blueprint.Alert,
        {
          isOpen: true,
          icon: 'lock',
          intent: 'primary',
          loading: true,
          cancelButtonText: 'Cancel',
          onCancel: ignore,
          onConfirm: ignore,
        },
        h('p', null, 'Sign in to answer.'),
      ),
    () => (
      <Alert
        cancelButtonText={constant('Cancel')}
        icon={'lock'}
        intent={'primary'}
        isOpen={constant(true)}
        loading={constant(true)}
      >
        <p>{constant('Sign in to answer.')}</p>
      </Alert>
    ),
  ],
] as const;

describe('overlays beside Blueprint React', () => {
  test.each(cases)('%s has the same markup', async (_name, theirs, ours) => {
    const blueprint = await portalLinesOf((container) =>
      mountBlueprint(
        () => h(Blueprint.OverlaysProvider, null, theirs()),
        container,
      ),
    );

    const synstate = await portalLinesOf((container) =>
      render(ours, container),
    );

    assert.deepStrictEqual(synstate, blueprint.map(disabledButtonTabIndex));
  });

  test.each(cases)('%s is drawn the same', async (_name, theirs, ours) => {
    freezeAnimations();

    const blueprint = await dialogShotOf((container) =>
      mountBlueprint(
        () => h(Blueprint.OverlaysProvider, null, theirs()),
        container,
      ),
    );

    const synstate = await dialogShotOf((container) => render(ours, container));

    assert.strictEqual(synstate, blueprint);
  });
});

describe(Dialog, () => {
  test('closes by Escape, the close button and the backdrop, as far as it may', async () => {
    const mut_closes: string[] = [];

    const { unmount } = mounted(() => (
      <Dialog
        canOutsideClickClose={false}
        isOpen={constant(true)}
        title={constant('T')}
        onClose={(event) => {
          mut_closes.push(event.type);
        }}
      >
        <div class={constant('bp6-dialog-body')} />
      </Dialog>
    ));

    await transitioned();

    one('.bp6-dialog').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    one<HTMLButtonElement>('.bp6-dialog-close-button').click();

    one('.bp6-overlay-backdrop').dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true }),
    );

    assert.deepStrictEqual(mut_closes, ['keydown', 'click']);

    unmount();
  });

  test('brings no focus into itself once a press on its backdrop has closed it', async () => {
    const [isOpen$, setIsOpen] = createState(true);

    const { unmount } = mounted(() => (
      <Dialog
        isOpen={isOpen$}
        title={constant('T')}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <div class={constant('bp6-dialog-body')} />
      </Dialog>
    ));

    await transitioned();

    await userEvent.click(one('.bp6-overlay-backdrop'), {
      position: { x: 5, y: 5 },
    });

    await nextFrame();

    // Still in its exit transition.
    assert.isFalse(one('.bp6-overlay').contains(document.activeElement));

    unmount();
  });

  test('does not close by Escape when it may not', async () => {
    const mut_closes: string[] = [];

    const { unmount } = mounted(() => (
      <Dialog
        canEscapeKeyClose={false}
        isOpen={constant(true)}
        onClose={(event) => {
          mut_closes.push(event.type);
        }}
      >
        <div class={constant('bp6-dialog-body')} />
      </Dialog>
    ));

    await transitioned();

    one('.bp6-dialog').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    one('.bp6-overlay-backdrop').dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true }),
    );

    assert.deepStrictEqual(mut_closes, ['mousedown']);

    unmount();
  });

  test('takes focus as it opens and gives it back as it closes', async () => {
    const [isOpen$, setIsOpen] = createState(false);

    const opener = document.createElement('button');

    document.body.append(opener);

    onTestFinished(() => {
      opener.remove();
    });

    const { unmount } = mounted(() => (
      <Dialog isOpen={isOpen$} title={constant('Email')}>
        <div class={constant('bp6-dialog-body')}>
          <InputGroup autoFocus={true} value={constant('')} />
        </div>
      </Dialog>
    ));

    opener.focus();

    setIsOpen(true);

    await transitioned();

    assert.strictEqual(document.activeElement, one('.bp6-dialog input'));

    // Focus that would leave it is brought back.
    opener.focus();

    assert.isTrue(one('.bp6-overlay').contains(document.activeElement));

    setIsOpen(false);

    await transitioned();

    assert.strictEqual(document.activeElement, opener);

    unmount();
  });

  test('runs the exit transition before it is removed, and marks the body while open', async () => {
    const [isOpen$, setIsOpen] = createState(true);

    const { unmount } = mounted(() => (
      <Dialog isOpen={isOpen$}>
        <div class={constant('bp6-dialog-body')} />
      </Dialog>
    ));

    await transitioned();

    assert.isTrue(document.body.classList.contains('bp6-overlay-open'));

    assert.isTrue(
      one('.bp6-dialog-container').classList.contains(
        'bp6-overlay-appear-done',
      ),
    );

    setIsOpen(false);

    // Blueprint's overlay stack takes the class off the body as it closes.
    assert.isFalse(document.body.classList.contains('bp6-overlay-open'));

    await settleMicrotasks();

    const container = one('.bp6-dialog-container');

    assert.isTrue(container.classList.contains('bp6-overlay-exit'));

    assert.isTrue(container.classList.contains('bp6-overlay-exit-active'));

    assert.isFalse(one('.bp6-overlay').classList.contains('bp6-overlay-open'));

    await transitioned();

    // What it drew is gone; the empty overlay stays, as Blueprint's does.
    assert.isNull(document.querySelector('.bp6-dialog-container'));

    assert.isNull(document.querySelector('.bp6-overlay-open'));

    setIsOpen(true);

    await settleMicrotasks();

    assert.isTrue(
      one('.bp6-dialog-container').classList.contains(
        'bp6-overlay-enter-active',
      ),
    );

    await transitioned();

    assert.isTrue(
      one('.bp6-dialog-container').classList.contains('bp6-overlay-enter-done'),
    );

    unmount();
  });

  test('does not close by an Escape that an input method takes', async () => {
    const mut_closes: string[] = [];

    const { unmount } = mounted(() => (
      <Dialog
        isOpen={constant(true)}
        onClose={(event) => {
          mut_closes.push(event.type);
        }}
      >
        <div class={constant('bp6-dialog-body')} />
      </Dialog>
    ));

    await transitioned();

    one('.bp6-dialog').dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        isComposing: true,
        bubbles: true,
      }),
    );

    assert.deepStrictEqual(mut_closes, []);

    unmount();
  });

  test('does not close by an Escape that a date input in it takes to close its calendar', async () => {
    const mut_closes: string[] = [];

    const { unmount } = mounted(() => (
      <Dialog
        isOpen={constant(true)}
        onClose={(event) => {
          mut_closes.push(event.type);
        }}
      >
        <div class={constant('bp6-dialog-body')}>
          <DateInput value={constant('')} onChange={ignore} />
          <DateRangeInput
            value={constant(['', ''] as const)}
            onChange={ignore}
          />
        </div>
      </Dialog>
    ));

    await transitioned();

    for (const selector of [
      '.bp6-date-input input',
      '.bp6-date-range-input .bp6-input-group:first-child input',
    ]) {
      // eslint-disable-next-line no-await-in-loop -- one input after the other
      await userEvent.click(one(selector));

      // eslint-disable-next-line no-await-in-loop -- one input after the other
      await userEvent.keyboard('{Escape}');
    }

    assert.deepStrictEqual(mut_closes, []);

    assert.strictEqual(document.querySelectorAll('.bp6-popover').length, 0);

    // One no control has taken is the dialog's.
    one('.bp6-dialog-body').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    assert.deepStrictEqual(mut_closes, ['keydown']);

    unmount();
  });

  test('stays open when it is closed and opened again at once, and closed when the other way round', async () => {
    const [isOpen$, setIsOpen] = createState(true);

    const { unmount } = mounted(() => (
      <Dialog isOpen={isOpen$}>
        <div class={constant('bp6-dialog-body')} />
      </Dialog>
    ));

    await transitioned();

    const drawn = one('.bp6-dialog-container');

    setIsOpen(false);

    setIsOpen(true);

    await transitioned();

    // The same one, never removed and drawn afresh.
    assert.strictEqual(one('.bp6-dialog-container'), drawn);

    assert.isTrue(drawn.classList.contains('bp6-overlay-enter-done'));

    assert.isTrue(document.body.classList.contains('bp6-overlay-open'));

    setIsOpen(false);

    await transitioned();

    setIsOpen(true);

    setIsOpen(false);

    await transitioned();

    // What it drew is gone; the empty overlay stays, as Blueprint's does.
    assert.isNull(document.querySelector('.bp6-dialog-container'));

    assert.isNull(document.querySelector('.bp6-overlay-open'));

    assert.isFalse(document.body.classList.contains('bp6-overlay-open'));

    unmount();
  });

  test('writes nothing while the update that opens or closes it propagates', async () => {
    const warn = vi.fn();

    vi.stubGlobal('console', { ...console, warn });

    onTestFinished(() => {
      // cspell:disable-next-line
      vi.unstubAllGlobals();
    });

    const [isOpen$, setIsOpen] = createState(false);

    const { unmount } = mounted(() => (
      <Dialog isOpen={isOpen$}>
        <div class={constant('bp6-dialog-body')} />
      </Dialog>
    ));

    setIsOpen(true);

    await transitioned();

    assert.isTrue(
      one('.bp6-dialog-container').classList.contains('bp6-overlay-enter-done'),
    );

    setIsOpen(false);

    await transitioned();

    assert.isNull(document.querySelector('.bp6-dialog-container'));

    assert.deepStrictEqual(warn.mock.calls, []);

    unmount();
  });

  test('opens with the appear transition when an opening before it was closed again in the same update', async () => {
    const [isOpen$, setIsOpen] = createState(false);

    const { unmount } = mounted(() => (
      <Dialog isOpen={isOpen$}>
        <div class={constant('bp6-dialog-body')} />
      </Dialog>
    ));

    setIsOpen(true);

    setIsOpen(false);

    await transitioned();

    // It never opened, so a lazy one has drawn nothing yet.
    assert.isNull(document.querySelector('.bp6-overlay'));

    setIsOpen(true);

    await transitioned();

    assert.isTrue(
      one('.bp6-dialog-container').classList.contains(
        'bp6-overlay-appear-done',
      ),
    );

    unmount();
  });

  test('gives focus back to the element from before it first opened, when it is opened again during the exit', async () => {
    const [isOpen$, setIsOpen] = createState(false);

    const opener = document.createElement('button');

    document.body.append(opener);

    onTestFinished(() => {
      opener.remove();
    });

    const { unmount } = mounted(() => (
      <Dialog isOpen={isOpen$} title={constant('T')}>
        <div class={constant('bp6-dialog-body')} />
      </Dialog>
    ));

    opener.focus();

    setIsOpen(true);

    await transitioned();

    one<HTMLButtonElement>('.bp6-dialog-close-button').focus();

    setIsOpen(false);

    await settleMicrotasks();

    setIsOpen(true);

    await transitioned();

    setIsOpen(false);

    await transitioned();

    assert.strictEqual(document.activeElement, opener);

    unmount();
  });

  test('leaves focus to the overlay on top while one is open over another', async () => {
    const [isAlertOpen$, setIsAlertOpen] = createState(false);

    const mut_closes: string[] = [];

    const { unmount } = mounted(() => (
      <>
        <Dialog
          isOpen={constant(true)}
          title={constant('T')}
          onClose={() => {
            mut_closes.push('dialog');
          }}
        >
          <div class={constant('bp6-dialog-body')}>
            <InputGroup value={constant('')} />
          </div>
        </Dialog>
        <Alert
          cancelButtonText={constant('Cancel')}
          canEscapeKeyCancel={true}
          isOpen={isAlertOpen$}
          onCancel={() => {
            mut_closes.push('alert');
          }}
        >
          <p>{constant('Sure?')}</p>
        </Alert>
      </>
    ));

    await transitioned();

    const input = one<HTMLInputElement>('.bp6-dialog input');

    input.focus();

    setIsAlertOpen(true);

    await transitioned();

    const alertOverlay = one('.bp6-alert').closest('.bp6-overlay');

    assert.isNotNull(alertOverlay);

    assert.isTrue(alertOverlay.contains(document.activeElement));

    // Focus that would go back to the dialog below is kept in the alert.
    input.focus();

    assert.isTrue(alertOverlay.contains(document.activeElement));

    const focused = document.activeElement;

    assert.isNotNull(focused);

    focused.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    assert.deepStrictEqual(mut_closes, ['alert']);

    setIsAlertOpen(false);

    await transitioned();

    // The dialog below, on top again, has focus back where it was.
    assert.strictEqual(document.activeElement, input);

    assert.isTrue(document.body.classList.contains('bp6-overlay-open'));

    unmount();
  });

  test('leaves focus where it is when the overlay below closes under one that stays open', async () => {
    const [isDialogOpen$, setIsDialogOpen] = createState(false);

    const [isAlertOpen$, setIsAlertOpen] = createState(false);

    const opener = document.createElement('button');

    document.body.append(opener);

    onTestFinished(() => {
      opener.remove();
    });

    const { unmount } = mounted(() => (
      <>
        <Dialog isOpen={isDialogOpen$} title={constant('T')}>
          <div class={constant('bp6-dialog-body')} />
        </Dialog>
        <Alert cancelButtonText={constant('Cancel')} isOpen={isAlertOpen$}>
          <p>{constant('Sure?')}</p>
        </Alert>
      </>
    ));

    opener.focus();

    setIsDialogOpen(true);

    await transitioned();

    setIsAlertOpen(true);

    await transitioned();

    const [, cancel] = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.bp6-alert-footer button'),
    );

    assert.isDefined(cancel);

    cancel.focus();

    setIsDialogOpen(false);

    await transitioned();

    assert.strictEqual(document.activeElement, cancel);

    assert.isTrue(document.body.classList.contains('bp6-overlay-open'));

    setIsAlertOpen(false);

    assert.isFalse(document.body.classList.contains('bp6-overlay-open'));

    unmount();
  });

  test.each([
    ['beside it', false],
    ['inside it', true],
  ] as const)(
    'gives focus back to the opener when it closes together with an overlay over it, drawn %s',
    async (_name, nested) => {
      const [isOpen$, setIsOpen] = createState(false);

      const [isAlertOpen$, setIsAlertOpen] = createState(false);

      const opener = document.createElement('button');

      document.body.append(opener);

      onTestFinished(() => {
        opener.remove();
      });

      const alert = (): JSX.Element => (
        <Alert isOpen={isAlertOpen$}>
          <p>{constant('Sure?')}</p>
        </Alert>
      );

      const { unmount } = mounted(() => (
        <>
          <Dialog isOpen={isOpen$} title={constant('T')}>
            <div class={constant('bp6-dialog-body')}>
              {nested ? alert() : []}
            </div>
          </Dialog>
          {nested ? [] : alert()}
        </>
      ));

      opener.focus();

      setIsOpen(true);

      await transitioned();

      one<HTMLButtonElement>('.bp6-dialog-close-button').focus();

      setIsAlertOpen(true);

      await transitioned();

      assert.isTrue(
        one('.bp6-alert')
          .closest('.bp6-overlay')
          ?.contains(document.activeElement) === true,
      );

      setIsOpen(false);

      setIsAlertOpen(false);

      await transitioned();

      await transitioned();

      assert.strictEqual(document.activeElement, opener);

      unmount();
    },
  );

  test('brings focus inside when it is opened again during the exit, and gives it back to what had it then', async () => {
    const [isOpen$, setIsOpen] = createState(true);

    const field = document.createElement('input');

    document.body.append(field);

    onTestFinished(() => {
      field.remove();
    });

    const { unmount } = mounted(() => (
      <Dialog isOpen={isOpen$} title={constant('T')}>
        <div class={constant('bp6-dialog-body')} />
      </Dialog>
    ));

    await transitioned();

    setIsOpen(false);

    // What the page does as it closes: it moves focus on.
    field.focus();

    await settleMicrotasks();

    setIsOpen(true);

    await transitioned();

    assert.isTrue(one('.bp6-overlay').contains(document.activeElement));

    setIsOpen(false);

    await transitioned();

    assert.strictEqual(document.activeElement, field);

    unmount();
  });

  test('does not close again by Escape during the exit, nor let it through', async () => {
    const mut_closes: string[] = [];

    const [isOpen$, setIsOpen] = createState(true);

    const { unmount } = mounted(() => (
      <Dialog
        isOpen={isOpen$}
        onClose={(event) => {
          mut_closes.push(event.type);

          setIsOpen(false);
        }}
      >
        <div class={constant('bp6-dialog-body')} />
      </Dialog>
    ));

    await transitioned();

    const mut_reachedThePage: string[] = [];

    const onPageKeyDown = (event: KeyboardEvent): void => {
      mut_reachedThePage.push(event.key);
    };

    document.addEventListener('keydown', onPageKeyDown);

    onTestFinished(() => {
      document.removeEventListener('keydown', onPageKeyDown);
    });

    const dialog = one('.bp6-dialog');

    dialog.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    dialog.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    assert.deepStrictEqual(mut_closes, ['keydown']);

    // Both are the overlay's, the one during the exit too.
    assert.deepStrictEqual(mut_reachedThePage, []);

    unmount();
  });

  test('wraps Shift+Tab to the last element Tab reaches, past what takes no focus', async () => {
    const { unmount } = mounted(() => (
      <Dialog isOpen={constant(true)}>
        <div class={constant('bp6-dialog-body')}>
          <button type={constant('button')}>{constant('A')}</button>
          <details>
            <summary>{constant('More')}</summary>
          </details>
          <fieldset disabled={constant(true)}>
            <button type={constant('button')}>{constant('B')}</button>
          </fieldset>
          <input type={constant('hidden')} />
          <div inert={constant(true)}>
            <button type={constant('button')}>{constant('C')}</button>
          </div>
          <button
            style={{ visibility: constant('hidden') }}
            type={constant('button')}
          >
            {constant('D')}
          </button>
        </div>
      </Dialog>
    ));

    await transitioned();

    const start = one('.bp6-overlay-start-focus-trap');

    start.focus();

    start.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
      }),
    );

    assert.strictEqual(document.activeElement, one('.bp6-dialog summary'));

    unmount();
  });

  test('keeps Tab inside, from the last element back to the first, as Blueprint does', async () => {
    const blueprint = await tabPastTheEnd((container) =>
      mountBlueprint(
        () =>
          h(
            Blueprint.OverlaysProvider,
            null,
            h(
              Blueprint.Dialog,
              { isOpen: true, title: 'T', onClose: ignore },
              h(
                'div',
                { className: 'bp6-dialog-body' },
                h(Blueprint.InputGroup, { value: '', onChange: ignore }),
              ),
            ),
          ),
        container,
      ),
    );

    const synstate = await tabPastTheEnd((container) =>
      render(
        () => (
          <Dialog isOpen={constant(true)} title={constant('T')}>
            <div class={constant('bp6-dialog-body')}>
              <InputGroup value={constant('')} />
            </div>
          </Dialog>
        ),
        container,
      ),
    );

    assert.strictEqual(synstate, blueprint);
  });
});

describe(Alert, () => {
  test('confirms and cancels, and tells `onClose` which', async () => {
    const mut_answers: string[] = [];

    const { unmount } = mounted(() => (
      <Alert
        cancelButtonText={constant('Cancel')}
        canEscapeKeyCancel={true}
        isOpen={constant(true)}
        onCancel={() => {
          mut_answers.push('cancel');
        }}
        onClose={(confirmed) => {
          mut_answers.push(`close ${confirmed.toString()}`);
        }}
        onConfirm={() => {
          mut_answers.push('confirm');
        }}
      >
        <p>{constant('Sure?')}</p>
      </Alert>
    ));

    await transitioned();

    const [confirm, cancel] = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.bp6-alert-footer button'),
    );

    confirm?.click();

    cancel?.click();

    one('.bp6-alert').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    // Blueprint's Alert may not be cancelled from the backdrop by default.
    one('.bp6-overlay-backdrop').dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true }),
    );

    assert.deepStrictEqual(mut_answers, [
      'confirm',
      'close true',
      'cancel',
      'close false',
      'cancel',
      'close false',
    ]);

    unmount();
  });

  test('draws no cancel button for empty text, as Blueprint does', async () => {
    const { unmount } = mounted(() => (
      <Alert cancelButtonText={constant('')} isOpen={constant(true)}>
        <p>{constant('Sure?')}</p>
      </Alert>
    ));

    await transitioned();

    assert.strictEqual(
      document.querySelectorAll('.bp6-alert-footer button').length,
      1,
    );

    unmount();
  });
});

/** The one element `selector` finds in the document. */
const one = <E extends Element = HTMLElement>(selector: string): E => {
  const found = document.querySelectorAll<E>(selector);

  assert.strictEqual(found.length, 1);

  const [element] = found;

  assert.isDefined(element);

  return element;
};

/**
 * Mounts a side, focuses its input, and moves focus to the trap after the
 * content, as Tab past the input does: the class of what then has focus.
 */
const tabPastTheEnd = async (
  mount: (container: HTMLElement) => () => void,
): Promise<string> => {
  const host = document.createElement('div');

  document.body.append(host);

  const unmount = mount(host);

  try {
    await transitioned();

    one<HTMLInputElement>('.bp6-dialog input').focus();

    // What Tab past the input does: it reaches the trap after the content.
    one<HTMLElement>('.bp6-overlay-end-focus-trap').focus();

    return document.activeElement === null
      ? ''
      : document.activeElement.className;
  } finally {
    unmount();

    host.remove();

    await transitioned();
  }
};

/** Mounts `app`, and unmounts it when the test finishes. */
const mounted = (app: () => JSX.Element): Readonly<{ unmount: () => void }> => {
  const container = document.createElement('div');

  document.body.append(container);

  const unmountApp = render(app, container);

  const mut_state = { mounted: true };

  const unmount = (): void => {
    if (!mut_state.mounted) {
      return;
    }

    mut_state.mounted = false;

    unmountApp();

    container.remove();
  };

  onTestFinished(unmount);

  return { unmount };
};

const settleMicrotasks = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

/**
 * Mounts a side, lets its open transition finish, and reads the markup of the
 * portal it draws in.
 */
const portalLinesOf = async (
  mount: (container: HTMLElement) => () => void,
): Promise<readonly string[]> => {
  const host = document.createElement('div');

  document.body.append(host);

  const unmount = mount(host);

  try {
    await transitioned();

    const portal = one('.bp6-portal');

    const wrapper = document.createElement('div');

    wrapper.append(portal.cloneNode(true));

    return linesOf(wrapper);
  } finally {
    unmount();

    host.remove();

    await transitioned();
  }
};

/** Until Blueprint React has drawn every icon's SVG, which it does later. */
const iconsDrawn = async (): Promise<void> => {
  for (const _ of range(0, 100)) {
    if (document.querySelector('.bp6-icon:not(:has(> svg))') === null) {
      return;
    }

    // eslint-disable-next-line no-await-in-loop
    await settleMicrotasks();
  }

  throw new Error('icons not drawn');
};

/**
 * Mounts a side, lets its open transition finish, and takes a picture of the
 * dialog, as base64 PNG.
 */
const dialogShotOf = async (
  mount: (container: HTMLElement) => () => void,
): Promise<string> => {
  const host = document.createElement('div');

  document.body.append(host);

  const unmount = mount(host);

  try {
    await transitioned();

    await iconsDrawn();

    return await page.screenshot({ element: one('.bp6-dialog'), save: false });
  } finally {
    unmount();

    host.remove();

    await transitioned();
  }
};
