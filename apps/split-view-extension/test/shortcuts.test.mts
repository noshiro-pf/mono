import {
  createPane,
  isReloadShortcut,
  paneNode,
  splitNode,
  tabLabelOf,
  tabTitleOf,
  workspacePositionFromCode,
  workspaceShortcutCodeOf,
  type WorkspaceState,
} from '../src/index.mjs';

const keyEvent = (
  code: string,
  modifiers?: Readonly<{ ctrl?: boolean; meta?: boolean; shift?: boolean }>,
): Parameters<typeof workspaceShortcutCodeOf>[0] =>
  ({
    altKey: true,
    ctrlKey: modifiers?.ctrl ?? false,
    metaKey: modifiers?.meta ?? false,
    shiftKey: modifiers?.shift ?? false,
    key: code,
    code,
    defaultPrevented: false,
    preventDefault: () => undefined,
  }) as const;

const reloadKey = (
  key: string,
  code: string,
  modifiers?: Readonly<{
    alt?: boolean;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
  }>,
): Parameters<typeof isReloadShortcut>[0] =>
  ({
    altKey: modifiers?.alt ?? false,
    ctrlKey: modifiers?.ctrl ?? false,
    metaKey: modifiers?.meta ?? false,
    shiftKey: modifiers?.shift ?? false,
    key,
    code,
    defaultPrevented: false,
    preventDefault: () => undefined,
  }) as const;

describe('workspaceShortcutCodeOf', () => {
  test('takes Alt with a digit', () => {
    assert.deepStrictEqual(
      workspaceShortcutCodeOf(keyEvent('Digit3')),
      'Digit3',
    );
  });

  test('leaves the browser its own bindings', () => {
    assert.deepStrictEqual(
      workspaceShortcutCodeOf(keyEvent('Digit3', { ctrl: true })),
      undefined,
    );

    assert.deepStrictEqual(
      workspaceShortcutCodeOf(keyEvent('Digit3', { meta: true })),
      undefined,
    );

    assert.deepStrictEqual(
      workspaceShortcutCodeOf(keyEvent('Digit3', { shift: true })),
      undefined,
    );

    assert.deepStrictEqual(
      workspaceShortcutCodeOf({ ...keyEvent('Digit3'), altKey: false }),
      undefined,
    );
  });

  test('takes no other key', () => {
    assert.deepStrictEqual(
      workspaceShortcutCodeOf(keyEvent('Digit0')),
      undefined,
    );

    assert.deepStrictEqual(
      workspaceShortcutCodeOf(keyEvent('KeyD')),
      undefined,
    );

    // What `Alt+1` types on macOS, which is why the test is on `code`.
    assert.deepStrictEqual(workspaceShortcutCodeOf(keyEvent('¡')), undefined);
  });
});

describe('isReloadShortcut', () => {
  test('takes Ctrl+R, and Cmd+R on macOS', () => {
    assert.isTrue(isReloadShortcut(reloadKey('r', 'KeyR', { ctrl: true })));

    assert.isTrue(isReloadShortcut(reloadKey('r', 'KeyR', { meta: true })));
  });

  test('takes the hard reload too', () => {
    assert.isTrue(
      isReloadShortcut(reloadKey('R', 'KeyR', { ctrl: true, shift: true })),
    );

    assert.isTrue(isReloadShortcut(reloadKey('F5', 'F5', { ctrl: true })));
  });

  test('takes F5, with Shift or without', () => {
    assert.isTrue(isReloadShortcut(reloadKey('F5', 'F5')));

    assert.isTrue(isReloadShortcut(reloadKey('F5', 'F5', { shift: true })));
  });

  test('takes no R without Ctrl or Cmd, and none with Alt', () => {
    assert.isFalse(isReloadShortcut(reloadKey('r', 'KeyR')));

    assert.isFalse(isReloadShortcut(reloadKey('r', 'KeyR', { alt: true })));

    assert.isFalse(
      isReloadShortcut(reloadKey('r', 'KeyR', { ctrl: true, alt: true })),
    );

    assert.isFalse(isReloadShortcut(reloadKey('F5', 'F5', { alt: true })));
  });

  test('takes no other key', () => {
    assert.isFalse(isReloadShortcut(reloadKey('t', 'KeyT', { ctrl: true })));

    assert.isFalse(isReloadShortcut(reloadKey('F6', 'F6')));
  });

  // Chrome reads the letter a Latin layout types, and falls back to the
  // physical key only for a layout that types no Latin letter.
  test('follows the letter the layout types', () => {
    // Dvorak: R is where QWERTY has O, and QWERTY's R types P.
    assert.isTrue(isReloadShortcut(reloadKey('r', 'KeyO', { ctrl: true })));

    assert.isFalse(isReloadShortcut(reloadKey('p', 'KeyR', { ctrl: true })));

    // Russian: the R key types к.
    assert.isTrue(isReloadShortcut(reloadKey('к', 'KeyR', { ctrl: true })));
  });
});

describe('workspacePositionFromCode', () => {
  test('is the digit itself', () => {
    assert.deepStrictEqual(workspacePositionFromCode('Digit1'), 1);

    assert.deepStrictEqual(workspacePositionFromCode('Digit9'), 9);
  });

  test('is nothing for a code that is not a shortcut', () => {
    assert.deepStrictEqual(workspacePositionFromCode('KeyA'), undefined);
  });
});

describe('tabTitleOf', () => {
  // The number leads because a tab strip truncates from the right.
  test('leads with the position', () => {
    assert.deepStrictEqual(tabTitleOf(2, '調査'), '2: 調査');
  });
});

describe('tabLabelOf', () => {
  // Pane 0 is on the right, so the first pane in tree order is pane 1.
  const view: WorkspaceState = {
    version: 1,
    root: splitNode('row', paneNode(1), paneNode(0)),
    panes: [
      { ...createPane(0), title: 'right' },
      { ...createPane(1), title: 'left' },
    ],
    nextPaneId: 2,
    activePaneId: 0,
  } as const;

  test('is the title the view was opened with, when it has one', () => {
    assert.deepStrictEqual(
      tabLabelOf({ ...view, title: '#2071 split view' }, '調査'),
      '#2071 split view',
    );
  });

  test('is otherwise the title of the first pane in tree order', () => {
    assert.deepStrictEqual(tabLabelOf(view, '調査'), 'left');
  });

  test('is the name of the split view while that pane has reported no title', () => {
    assert.deepStrictEqual(
      tabLabelOf(
        { ...view, panes: [view.panes[0] ?? createPane(0), createPane(1)] },
        '調査',
      ),
      '調査',
    );
  });
});
