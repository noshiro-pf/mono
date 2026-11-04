import { Collapse } from 'blueprint-synstate';
import { createState } from 'synstate';
import { constant } from 'synstate-dom';
import { mountInto, one } from './helpers.mjs';

describe(Collapse, () => {
  test('slides the body away from its height and back, keeping it in the document', async () => {
    fakeTimers();

    const [isOpen$, setOpen] = createState(true);

    const { collapse, body, unmount } = setUp(isOpen$, true);

    await afterUpdates();

    assert.strictEqual(collapse.style.height, 'auto');

    assert.strictEqual(collapse.style.overflowY, 'visible');

    assert.strictEqual(body.getAttribute('aria-hidden'), 'false');

    assert.strictEqual(body.style.transform, 'translateY(0px)');

    setOpen(false);

    await afterUpdates();

    // From the body's height, measured as the closing starts …
    assert.strictEqual(collapse.style.height, '40px');

    // The next task …
    vi.advanceTimersToNextTimer();

    // … to nothing, the body moving up with it.
    assert.strictEqual(collapse.style.height, '0px');

    assert.strictEqual(body.style.transform, 'translateY(-40px)');

    // Past Blueprint's 200ms.
    vi.advanceTimersToNextTimer();

    // In a container with no height of its own, which Blueprint's style sheet
    // makes 0.
    assert.strictEqual(collapse.style.height, '');

    assert.strictEqual(body.getAttribute('aria-hidden'), 'true');

    assert.strictEqual(body.style.transform, 'translateY(-40px)');

    assert.strictEqual(body.textContent, 'Body');

    setOpen(true);

    await afterUpdates();

    // On its way to the measured height; `auto` only once there.
    assert.strictEqual(collapse.style.height, '40px');

    assert.strictEqual(body.style.transform, 'translateY(0px)');

    // Past Blueprint's 200ms.
    vi.advanceTimersToNextTimer();

    assert.strictEqual(collapse.style.height, 'auto');

    assert.strictEqual(body.getAttribute('aria-hidden'), 'false');

    unmount();
  });

  test('ends closed when opened and closed again at once', async () => {
    fakeTimers();

    const [isOpen$, setOpen] = createState(false);

    const { collapse, body, unmount } = setUp(isOpen$, true);

    await afterUpdates();

    setOpen(true);

    setOpen(false);

    await afterUpdates();

    vi.runAllTimers();

    await afterUpdates();

    assert.strictEqual(collapse.style.height, '');

    assert.strictEqual(body.getAttribute('aria-hidden'), 'true');

    unmount();
  });

  test('does not move for a change undone in the same task', async () => {
    fakeTimers();

    const [isOpen$, setOpen] = createState(true);

    const { collapse, unmount } = setUp(isOpen$, true);

    await afterUpdates();

    setOpen(false);

    setOpen(true);

    await afterUpdates();

    assert.strictEqual(collapse.style.height, 'auto');

    assert.strictEqual(vi.getTimerCount(), 0);

    unmount();
  });

  test('opens again from part way through a closing, and stays open', async () => {
    fakeTimers();

    const [isOpen$, setOpen] = createState(true);

    const { collapse, body, unmount } = setUp(isOpen$, true);

    await afterUpdates();

    setOpen(false);

    await afterUpdates();

    // Into the closing proper.
    vi.advanceTimersToNextTimer();

    assert.strictEqual(collapse.style.height, '0px');

    setOpen(true);

    await afterUpdates();

    assert.strictEqual(collapse.style.height, '40px');

    // The closing's own timer is gone: only the opening's is left to fire.
    vi.runAllTimers();

    assert.strictEqual(collapse.style.height, 'auto');

    assert.strictEqual(body.getAttribute('aria-hidden'), 'false');

    unmount();
  });

  test('leaves no timer behind when unmounted while moving', async () => {
    fakeTimers();

    const [isOpen$, setOpen] = createState(true);

    const { unmount } = setUp(isOpen$, true);

    await afterUpdates();

    setOpen(false);

    await afterUpdates();

    assert.isAbove(vi.getTimerCount(), 0);

    unmount();

    assert.strictEqual(vi.getTimerCount(), 0);
  });

  test('makes the children only while open, unless told to keep them', async () => {
    fakeTimers();

    const [isOpen$, setOpen] = createState(false);

    const { body, unmount } = setUp(isOpen$, false);

    assert.strictEqual(body.childElementCount, 0);

    setOpen(true);

    await afterUpdates();

    assert.strictEqual(body.textContent, 'Body');

    setOpen(false);

    await afterUpdates();

    // The closing's two steps.
    vi.runAllTimers();

    assert.strictEqual(body.childElementCount, 0);

    unmount();
  });
});

/** A Collapse round a 40px paragraph. */
const setUp = (
  isOpen$: Parameters<typeof Collapse>[0]['isOpen'],
  keepChildrenMounted: boolean,
): Readonly<{
  collapse: HTMLElement;
  body: HTMLElement;
  unmount: () => void;
}> => {
  const { container, unmount } = mountInto(() => (
    <Collapse isOpen={isOpen$} keepChildrenMounted={keepChildrenMounted}>
      <p style={{ height: constant('40px'), margin: constant('0') }}>
        {constant('Body')}
      </p>
    </Collapse>
  ));

  return {
    collapse: one(container, '.bp6-collapse'),
    body: one(container, '.bp6-collapse > .bp6-collapse-body'),
    unmount,
  };
};

/**
 * Lets the work queued after an update run, and the work that work queues in
 * turn.
 */
const afterUpdates = async (): Promise<void> => {
  for (const _ of [1, 2, 3, 4]) {
    // eslint-disable-next-line no-await-in-loop -- one microtask after another
    await Promise.resolve();
  }
};

/**
 * Fakes the animation's timers for the test: the work after an update waits for
 * a microtask instead, which `afterUpdates` lets run.
 */
const fakeTimers = (): void => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

  onTestFinished(() => {
    vi.useRealTimers();
  });
};
