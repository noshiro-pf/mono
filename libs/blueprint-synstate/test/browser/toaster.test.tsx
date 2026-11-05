// The toaster beside Blueprint React's `OverlayToaster`, and how it behaves.
import * as Blueprint from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import {
  Button,
  createToaster,
  Dialog,
  type Toaster,
  type ToastProps,
} from 'blueprint-synstate';
import { createRoot } from 'react-dom/client';
import { createState } from 'synstate';
import { constant } from 'synstate-dom';
import { userEvent } from 'vitest/browser';
import {
  freezeAnimations,
  mountInto,
  nextFrame,
  transitioned,
} from './helpers.mjs';
import { linesAfter, shotAfter, stage } from './stage.mjs';

/** The toasts each side is shown, in order. */
type Shown = readonly Readonly<{
  key?: string;
  message: string;
  intent?: Blueprint.Intent & ToastProps['intent'];
  icon?: Blueprint.IconName & ToastProps['icon'];
  isCloseButtonShown?: boolean;
  timeout?: number;
}>[];

type Case = readonly [
  name: string,
  shown: Shown,
  /** Then dismissed, by key. */
  dismissed: readonly string[],
];

const cases: readonly Case[] = [
  [
    'A toast',
    [{ message: 'Saved.', intent: 'success', icon: 'tick', timeout: 0 }],
    [],
  ],
  [
    'Two toasts, newest first, one without its close button',
    [
      { message: 'Saved.', intent: 'success', icon: 'tick', timeout: 0 },
      {
        message: 'Could not reach the server.',
        intent: 'danger',
        icon: 'error',
        isCloseButtonShown: false,
        timeout: 0,
      },
    ],
    [],
  ],
  [
    'The empty toaster once its toast is dismissed',
    [{ key: 'only', message: 'Saved.', timeout: 0 }],
    ['only'],
  ],
] as const;

const ignore = (): void => {};

/** A side's toaster, as the comparison drives it. */
type Side = Readonly<{
  show: (toast: Shown[number]) => void;
  dismiss: (key: string) => void;
}>;

/**
 * Mounts a side's toaster on the stage, positioned so that the toasts are drawn
 * inside it, and shows and dismisses what the case says.
 */
const compared = (
  create: (host: HTMLElement) => Promise<Side>,
  shown: Shown,
  dismissed: readonly string[],
): readonly [
  mount: (host: HTMLElement) => () => void,
  open: () => Promise<void>,
] => {
  const mut_side: { created: Promise<Side> | undefined } = {
    created: undefined,
  };

  return [
    (host) => {
      host.style.setProperty('position', 'relative');

      mut_side.created = create(host);

      return ignore;
    },
    async () => {
      const side = await mut_side.created;

      assert.isDefined(side);

      // Each once the one before has entered: Blueprint moves the transition
      // classes of every toast onto the one mounted last (see the README).
      await shown.reduce(async (before, toast) => {
        await before;

        side.show(toast);

        await transitioned(500);
      }, Promise.resolve());

      for (const key of dismissed) {
        side.dismiss(key);
      }

      await transitioned(500);
    },
  ];
};

const theirs = async (host: HTMLElement): Promise<Side> => {
  const toaster = await Blueprint.OverlayToaster.create(
    {},
    {
      container: host,
      // Unmounted as the test finishes, so that its overlay and listeners do
      // not reach the tests after it.
      domRenderer: (element, container) => {
        const root = createRoot(container);

        root.render(element);

        onTestFinished(() => {
          root.unmount();
        });
      },
    },
  );

  return {
    show: ({ key, ...toast }) => {
      toaster.show(toast, key);
    },
    dismiss: (key) => {
      toaster.dismiss(key);
    },
  };
};

const ours = (host: HTMLElement): Promise<Side> => {
  const toaster = createToaster({}, host);

  onTestFinished(toaster.remove);

  return Promise.resolve({
    show: ({ key, message, ...toast }) => {
      toaster.show({ ...toast, message: constant(message) }, key);
    },
    dismiss: (key) => {
      toaster.dismiss(key);
    },
  });
};

describe('the toaster beside Blueprint React', () => {
  test.each(cases)(
    '%s has the same markup',
    async (_name, shown, dismissed) => {
      const blueprint = await linesAfter(...compared(theirs, shown, dismissed));

      const synstate = await linesAfter(...compared(ours, shown, dismissed));

      assert.deepStrictEqual(synstate, blueprint);
    },
  );

  test.each(cases)('%s is drawn the same', async (_name, shown, dismissed) => {
    freezeAnimations();

    const blueprint = await shotAfter(...compared(theirs, shown, dismissed));

    const synstate = await shotAfter(...compared(ours, shown, dismissed));

    assert.strictEqual(synstate, blueprint);
  });
});

describe(createToaster, () => {
  test('adds nothing to its container until a toast is shown', async () => {
    const host = stage();

    const toaster = createToaster({}, host);

    onTestFinished(() => {
      toaster.remove();

      host.remove();
    });

    // A toaster made as a module loads may never show a toast, and would
    // otherwise leave an empty element at the end of the body.
    assert.strictEqual(host.childNodes.length, 0);

    toaster.show({ message: constant('Saved.'), timeout: 0 });

    await nextFrame();

    assert.strictEqual(host.childNodes.length, 1);

    assert.isNotNull(host.querySelector('.bp6-toast'));

    toaster.remove();

    assert.strictEqual(host.childNodes.length, 0);
  });

  test('ignores a toast shown once it is removed', () => {
    const host = stage();

    onTestFinished(() => {
      host.remove();
    });

    const toaster = createToaster({}, host);

    toaster.show({ message: constant('Saving.'), timeout: 0 });

    toaster.remove();

    assert.deepStrictEqual(toaster.getToasts(), []);

    // A toast shown late, as by a handler still waiting on a request.
    const keys = [
      toaster.show({ message: constant('Saved.'), timeout: 0 }),
      toaster.show({ message: constant('Saved.'), timeout: 0 }),
    ] as const;

    assert.strictEqual(host.childNodes.length, 0);

    assert.deepStrictEqual(toaster.getToasts(), []);

    assert.notStrictEqual(keys[0], keys[1]);
  });

  test('dismisses a toast once its timeout is over, and says so', async () => {
    const toaster = mountedToaster();

    const mut_dismissals: boolean[] = [];

    toaster.show({
      message: constant('Saved.'),
      timeout: 200,
      onDismiss: (didTimeoutExpire) => {
        mut_dismissals.push(didTimeoutExpire);
      },
    });

    assert.strictEqual(toaster.getToasts().length, 1);

    await transitioned(300);

    assert.deepStrictEqual(mut_dismissals, [true]);

    assert.deepStrictEqual(toaster.getToasts(), []);

    // Gone once its exit is over.
    await transitioned(500);

    assert.isNull(document.querySelector('.bp6-toast'));
  });

  test('waits while the pointer is over a toast, and starts afresh as it leaves', async () => {
    const toaster = mountedToaster();

    toaster.show({ message: constant('Saved.'), timeout: 300 });

    await transitioned(50);

    const toast = document.querySelector('.bp6-toast');

    assert.instanceOf(toast, HTMLElement);

    toast.dispatchEvent(new MouseEvent('mouseenter'));

    await transitioned();

    assert.strictEqual(toaster.getToasts().length, 1);

    toast.dispatchEvent(new MouseEvent('mouseleave'));

    await transitioned(200);

    assert.strictEqual(toaster.getToasts().length, 1);

    await transitioned(200);

    assert.deepStrictEqual(toaster.getToasts(), []);
  });

  test('is dismissed by its close button, which is not the timeout', async () => {
    const toaster = mountedToaster();

    const mut_dismissals: boolean[] = [];

    toaster.show({
      message: constant('Saved.'),
      timeout: 0,
      onDismiss: (didTimeoutExpire) => {
        mut_dismissals.push(didTimeoutExpire);
      },
    });

    await transitioned(50);

    const close = document.querySelector('.bp6-toast button');

    assert.instanceOf(close, HTMLElement);

    await userEvent.click(close);

    assert.deepStrictEqual(mut_dismissals, [false]);

    assert.deepStrictEqual(toaster.getToasts(), []);
  });

  test('replaces in place the toast shown with the same key', async () => {
    const toaster = mountedToaster();

    toaster.show({ message: constant('Saving…'), timeout: 0 }, 'save');

    await transitioned(100);

    const toast = document.querySelector('.bp6-toast');

    assert.instanceOf(toast, HTMLElement);

    toaster.show(
      { message: constant('Saved.'), intent: 'success', timeout: 0 },
      'save',
    );

    await transitioned(50);

    assert.strictEqual(document.querySelectorAll('.bp6-toast').length, 1);

    assert.strictEqual(document.querySelector('.bp6-toast'), toast);

    assert.isTrue(toast.classList.contains('bp6-intent-success'));

    assert.strictEqual(
      document.querySelector('.bp6-toast-message')?.textContent,
      'Saved.',
    );
  });

  test('holds back a toast shown within 50 ms of the one before', async () => {
    const toaster = mountedToaster();

    toaster.show({ message: constant('First'), timeout: 0 });

    toaster.show({ message: constant('Second'), timeout: 0 });

    assert.strictEqual(toaster.getToasts().length, 1);

    await transitioned(100);

    assert.deepStrictEqual(
      Array.from(
        document.querySelectorAll('.bp6-toast-message'),
        (message) => message.textContent,
      ),
      ['Second', 'First'],
    );
  });

  test('dismisses the oldest toast past `maxToasts`', async () => {
    const toaster = mountedToaster({ maxToasts: 2 });

    await ['First', 'Second', 'Third'].reduce(async (before, message) => {
      await before;

      toaster.show({ message: constant(message), timeout: 0 });

      await transitioned(100);
    }, Promise.resolve());

    assert.deepStrictEqual(
      toaster.getToasts().map(({ key }) => key),
      ['toast-2', 'toast-1'],
    );
  });

  test('clears every toast, and those waiting, by Escape', async () => {
    const toaster = mountedToaster();

    const mut_dismissals: boolean[] = [];

    const onDismiss = (didTimeoutExpire: boolean): void => {
      mut_dismissals.push(didTimeoutExpire);
    };

    toaster.show({ message: constant('First'), timeout: 0, onDismiss });

    toaster.show({ message: constant('Second'), timeout: 0, onDismiss });

    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    await transitioned(100);

    assert.deepStrictEqual(toaster.getToasts(), []);

    assert.deepStrictEqual(mut_dismissals, [false]);
  });

  test('draws the classes of the toast that replaces one by its key', async () => {
    const toaster = mountedToaster();

    toaster.show(
      { message: constant('Saving…'), class: 'saving', timeout: 0 },
      'save',
    );

    await transitioned(100);

    toaster.show(
      { message: constant('Saved.'), class: 'saved', timeout: 0 },
      'save',
    );

    await transitioned(50);

    const toast = document.querySelector('.bp6-toast');

    assert.instanceOf(toast, HTMLElement);

    assert.isFalse(toast.classList.contains('saving'));

    assert.isTrue(toast.classList.contains('saved'));
  });

  test('lets a dialog opened with a toast take focus, and Escape in it close it alone', async () => {
    const toaster = mountedToaster();

    const [isOpen$, setIsOpen] = createState(false);

    const mut_closes: string[] = [];

    const { unmount } = mountInto(() => (
      <Dialog
        isOpen={isOpen$}
        onClose={(event) => {
          mut_closes.push(event.type);

          setIsOpen(false);
        }}
      >
        <Button text={constant('Inside')} />
      </Dialog>
    ));

    onTestFinished(unmount);

    setIsOpen(true);

    toaster.show({ message: constant('Saved.'), timeout: 0 });

    await transitioned();

    const dialogOverlay = document.querySelector(
      '.bp6-overlay-scroll-container',
    );

    assert.instanceOf(dialogOverlay, HTMLElement);

    assert.isTrue(dialogOverlay.contains(document.activeElement));

    await userEvent.keyboard('{Escape}');

    assert.deepStrictEqual(mut_closes, ['keydown']);

    assert.strictEqual(toaster.getToasts().length, 1);
  });

  test('leaves a press on the backdrop of a dialog beneath it to bring focus back', async () => {
    const toaster = mountedToaster();

    const { unmount } = mountInto(() => (
      <Dialog canOutsideClickClose={false} isOpen={constant(true)}>
        <Button text={constant('Inside')} />
      </Dialog>
    ));

    onTestFinished(unmount);

    await transitioned();

    toaster.show({ message: constant('Saved.'), timeout: 0 });

    await transitioned(100);

    const backdrop = document.querySelector('.bp6-overlay-backdrop');

    assert.instanceOf(backdrop, HTMLElement);

    // A real press, whose default moves focus to the body after its handlers.
    await userEvent.click(backdrop, { position: { x: 5, y: 5 } });

    await nextFrame();

    const dialogOverlay = document.querySelector(
      '.bp6-overlay-scroll-container',
    );

    assert.instanceOf(dialogOverlay, HTMLElement);

    assert.isTrue(dialogOverlay.contains(document.activeElement));
  });
});

/** A toaster on a stage, taken away when the test finishes. */
const mountedToaster = (
  props?: Parameters<typeof createToaster>[0],
): Toaster => {
  const host = stage();

  const toaster = createToaster(props, host);

  onTestFinished(() => {
    toaster.remove();

    host.remove();
  });

  return toaster;
};
