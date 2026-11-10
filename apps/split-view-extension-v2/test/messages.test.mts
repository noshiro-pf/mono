import { Arr } from 'ts-data-forge';
import {
  asFrameToPage,
  asGitHubMessage,
  asListReply,
  asListRequest,
  asNestedKey,
  asPageToFrame,
  asPaneId,
  asResetOriginRequest,
  asResetOriginsReply,
  asSplitOpenRequest,
  frameTag,
  githubTag,
  isPaneOfFrameQuery,
  isReloadKey,
  isZoomWheel,
  listTag,
  paneIdOfFrameName,
  paneKeyOf,
  positionOfShortcut,
  unassignedKeyRoute,
  wheelZoomStep,
  workerTag,
  workspaceShortcutOf,
  type KeyLike,
  type WheelZoomStep,
} from '../src/index.mjs';

describe('frame messages', () => {
  test('a state report is read field by field', () => {
    const state = {
      tag: frameTag,
      kind: 'state',
      paneId: 2,
      url: 'https://a.example/',
      title: 'A',
      historyLength: 3,
    } as const;

    expect(asFrameToPage({ ...state, extra: true })).toStrictEqual(state);

    expect(asFrameToPage({ ...state, historyLength: '3' })).toBeUndefined();

    expect(asFrameToPage({ ...state, tag: 'other' })).toBeUndefined();

    expect(asFrameToPage({ ...state, kind: 'unknown' })).toBeUndefined();
  });

  test('zoom, shortcut, leaving and worker counts', () => {
    expect(
      asFrameToPage({ tag: frameTag, kind: 'zoom', paneId: 0, step: 'in' }),
    ).toStrictEqual({ tag: frameTag, kind: 'zoom', paneId: 0, step: 'in' });

    expect(
      asFrameToPage({ tag: frameTag, kind: 'zoom', paneId: 0, step: 'reset' }),
    ).toBeUndefined();

    expect(
      asFrameToPage({
        tag: frameTag,
        kind: 'service-workers',
        paneId: 0,
        count: 2,
      }),
    ).toMatchObject({ count: 2 });

    expect(
      asFrameToPage({
        tag: frameTag,
        kind: 'leaving',
        paneId: 0,
        url: 'about:blank',
      }),
    ).toMatchObject({ url: 'about:blank' });

    expect(
      asFrameToPage({
        tag: frameTag,
        kind: 'leaving',
        paneId: 0,
        url: 'https://a.example/',
      }),
    ).toMatchObject({ url: 'https://a.example/' });

    expect(
      asFrameToPage({
        tag: frameTag,
        kind: 'leaving',
        paneId: 0,
        url: 'chrome://settings',
      }),
    ).toBeUndefined();
  });

  test('a pane document asks to be assigned', () => {
    expect(
      asFrameToPage({ tag: frameTag, kind: 'hello', paneId: 3 }),
    ).toStrictEqual({ tag: frameTag, kind: 'hello', paneId: 3 });

    expect(
      asFrameToPage({ tag: frameTag, kind: 'hello', paneId: -3 }),
    ).toBeUndefined();
  });

  test('page to frame', () => {
    expect(
      asPageToFrame({
        tag: frameTag,
        kind: 'command',
        paneId: 1,
        command: 'back',
      }),
    ).toStrictEqual({
      tag: frameTag,
      kind: 'command',
      paneId: 1,
      command: 'back',
    });

    expect(
      asPageToFrame({
        tag: frameTag,
        kind: 'command',
        paneId: 1,
        command: 'eval',
      }),
    ).toBeUndefined();

    expect(asPageToFrame({ tag: frameTag, kind: 'assign' })).toBeUndefined();
  });

  test('nested keys take only a reload or a digit', () => {
    expect(
      asNestedKey({
        tag: frameTag,
        kind: 'nested-key',
        key: { kind: 'reload' },
      }),
    ).toMatchObject({ key: { kind: 'reload' } });

    expect(
      asNestedKey({
        tag: frameTag,
        kind: 'nested-key',
        key: { kind: 'workspace', code: 'Digit0' },
      }),
    ).toBeUndefined();
  });

  test('frame names and answers', () => {
    expect(paneIdOfFrameName('split-view-pane:12')).toBe(12);

    expect(paneIdOfFrameName('split-view-pane:1x')).toBeUndefined();

    expect(paneIdOfFrameName('other')).toBeUndefined();

    expect(asPaneId(3)).toBe(3);

    expect(asPaneId(-1)).toBeUndefined();

    expect(asPaneId(null)).toBeUndefined();
  });
});

describe('worker messages', () => {
  test('pane-of-frame and split-open', () => {
    expect(isPaneOfFrameQuery({ tag: workerTag, kind: 'pane-of-frame' })).toBe(
      true,
    );

    expect(
      asSplitOpenRequest({
        tag: workerTag,
        kind: 'split-open',
        tabId: 4,
        paneId: 'x',
        axis: 'row',
      }),
    ).toStrictEqual({
      tag: workerTag,
      kind: 'split-open',
      tabId: 4,
      paneId: undefined,
      axis: 'row',
      url: undefined,
    });

    expect(
      asSplitOpenRequest({
        tag: workerTag,
        kind: 'split-open',
        tabId: 4,
        axis: 'z',
      }),
    ).toBeUndefined();
  });

  test('GitHub open validates every field', () => {
    const open = {
      tag: githubTag,
      kind: 'open',
      url: 'https://github.com/o/r/pull/1',
      title: 'T',
      issueUrl: undefined,
      sessionUrl: undefined,
      active: true,
      closeOpener: false,
    } as const;

    expect(asGitHubMessage(open)).toStrictEqual(open);

    expect(asGitHubMessage({ ...open, title: 3 })).toBeUndefined();

    expect(asGitHubMessage({ ...open, active: 'yes' })).toBeUndefined();

    expect(
      asGitHubMessage({ tag: githubTag, kind: 'look-up', url: 'u' }),
    ).toStrictEqual({ tag: githubTag, kind: 'look-up', url: 'u' });
  });
});

const key = (overrides: Partial<KeyLike>): KeyLike =>
  ({
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    key: '',
    code: '',
    defaultPrevented: false,
    ...overrides,
  }) as const;

describe('keys', () => {
  test('Alt+digit by code, not key', () => {
    expect(
      workspaceShortcutOf(key({ altKey: true, key: '¡', code: 'Digit1' })),
    ).toBe('Digit1');

    expect(
      workspaceShortcutOf(
        key({ altKey: true, shiftKey: true, code: 'Digit1' }),
      ),
    ).toBeUndefined();

    expect(
      workspaceShortcutOf(key({ altKey: true, code: 'Digit0' })),
    ).toBeUndefined();

    expect(positionOfShortcut('Digit9')).toBe(9);

    expect(positionOfShortcut('KeyA')).toBeUndefined();
  });

  test('reload keys', () => {
    expect(isReloadKey(key({ ctrlKey: true, key: 'r', code: 'KeyR' }))).toBe(
      true,
    );

    expect(isReloadKey(key({ metaKey: true, key: 'R', code: 'KeyR' }))).toBe(
      true,
    );

    // Dvorak: the key that types R is not KeyR.
    expect(isReloadKey(key({ ctrlKey: true, key: 'r', code: 'KeyO' }))).toBe(
      true,
    );

    expect(isReloadKey(key({ ctrlKey: true, key: 'к', code: 'KeyR' }))).toBe(
      true,
    );

    expect(isReloadKey(key({ code: 'F5', key: 'F5' }))).toBe(true);

    expect(isReloadKey(key({ code: 'KeyR', key: 'r' }))).toBe(false);

    expect(isReloadKey(key({ altKey: true, ctrlKey: true, key: 'r' }))).toBe(
      false,
    );
  });

  test('a key the site took is left alone', () => {
    expect(
      paneKeyOf(key({ ctrlKey: true, key: 'r', defaultPrevented: true })),
    ).toBeUndefined();

    expect(paneKeyOf(key({ altKey: true, code: 'Digit2' }))).toStrictEqual({
      kind: 'workspace',
      code: 'Digit2',
    });
  });

  test('an unassigned frame routes its key', () => {
    expect(
      unassignedKeyRoute(
        { parentIsSplitPage: false, namedAsPane: false },
        { kind: 'reload' },
      ),
    ).toBe('hand-up');

    expect(
      unassignedKeyRoute(
        { parentIsSplitPage: true, namedAsPane: true },
        { kind: 'reload' },
      ),
    ).toBe('reload-self');

    expect(
      unassignedKeyRoute(
        { parentIsSplitPage: true, namedAsPane: true },
        { kind: 'workspace', code: 'Digit1' },
      ),
    ).toBe('leave');
  });

  test('Ctrl+wheel zooms a step, in or out', () => {
    expect(
      wheelZoomStep(undefined, { ctrlKey: true, deltaY: -3, timeStamp: 0 }),
    ).toStrictEqual({ last: { at: 0, step: 'in' }, step: 'in' });

    expect(
      wheelZoomStep(undefined, { ctrlKey: true, deltaY: 120, timeStamp: 0 }),
    ).toStrictEqual({ last: { at: 0, step: 'out' }, step: 'out' });
  });

  test('a wheel without Ctrl is not a zoom', () => {
    expect(
      wheelZoomStep(undefined, { ctrlKey: false, deltaY: 100, timeStamp: 0 }),
    ).toStrictEqual({ last: undefined, step: undefined });
  });

  test('a pinch, a burst of events, takes a step at most every 60ms', () => {
    // 20 events 15ms apart: 285ms of pinching.
    const pinch = Array.from({ length: 20 }, (_, index) => ({
      ctrlKey: true,
      deltaY: -2,
      timeStamp: index * 15,
    }));

    const steps = pinch.reduce<
      Readonly<{ last: WheelZoomStep | undefined; steps: readonly string[] }>
    >(
      (acc, event) => {
        const next = wheelZoomStep(acc.last, event);

        return {
          last: next.last,
          steps:
            next.step === undefined
              ? acc.steps
              : Arr.toPushed(acc.steps, next.step),
        };
      },
      { last: undefined, steps: [] },
    ).steps;

    expect(steps).toStrictEqual(['in', 'in', 'in', 'in', 'in']);
  });

  test('turning the other way steps at once', () => {
    expect(
      wheelZoomStep(
        { at: 100, step: 'in' },
        { ctrlKey: true, deltaY: 100, timeStamp: 110 },
      ),
    ).toStrictEqual({ last: { at: 110, step: 'out' }, step: 'out' });
  });

  test('a Ctrl+wheel with no vertical delta is left alone', () => {
    expect(isZoomWheel({ ctrlKey: true, deltaY: 0 })).toBe(false);

    expect(isZoomWheel({ ctrlKey: false, deltaY: 5 })).toBe(false);

    expect(isZoomWheel({ ctrlKey: true, deltaY: -5 })).toBe(true);
  });
});

describe('list messages', () => {
  test('a list operation is read field by field', () => {
    const request = {
      tag: listTag,
      kind: 'list-op',
      op: { kind: 'rename', id: 'a', name: 'A' },
    } as const;

    expect(asListRequest(request)).toStrictEqual(request);

    expect(
      asListRequest({ ...request, op: { kind: 'rename', id: 'a' } }),
    ).toBeUndefined();

    expect(
      asListRequest({ ...request, op: { kind: 'drop-everything' } }),
    ).toBeUndefined();

    expect(
      asListRequest({
        ...request,
        op: { kind: 'import', entries: [{ id: '', name: 'X' }], now: 1 },
      }),
    ).toBeUndefined();

    expect(asListRequest({ ...request, tag: 'other' })).toBeUndefined();
  });

  test.each([
    { kind: 'show', id: undefined, name: 'n', now: 1, activate: false },
    { kind: 'create', id: 'x', now: 1 },
    { kind: 'remove', id: 'x', freshId: 'y', now: 1 },
    { kind: 'move', id: 'x', offset: -1 },
    { kind: 'activate', id: 'x' },
    { kind: 'set-pinned', id: 'x', pinned: true },
    { kind: 'import', entries: [{ id: 'x', name: 'X' }], now: 1 },
  ])('every operation survives the trip: %j', (op) => {
    expect(
      asListRequest({ tag: listTag, kind: 'list-op', op })?.op,
    ).toStrictEqual(op);
  });

  test('a reply carries the list and the answer, repaired', () => {
    expect(
      asListReply({
        tag: listTag,
        kind: 'list',
        list: { entries: [{ id: 'a', name: 'A' }], activeId: 'a' },
        answer: { kind: 'shown', id: 'a' },
      }),
    ).toStrictEqual({
      tag: listTag,
      kind: 'list',
      list: {
        version: 1,
        entries: [{ id: 'a', name: 'A', createdAt: 0, pinned: false }],
        activeId: 'a',
      },
      answer: { kind: 'shown', id: 'a' },
    });

    expect(
      asListReply({ tag: listTag, kind: 'list', list: {}, answer: {} }),
    ).toBeUndefined();
  });

  test('an always-clear toggle and its answer', () => {
    const request = {
      tag: listTag,
      kind: 'reset-origin',
      origin: 'https://a.example',
      enabled: true,
    } as const;

    expect(asResetOriginRequest(request)).toStrictEqual(request);

    expect(
      asResetOriginRequest({ ...request, enabled: 'yes' }),
    ).toBeUndefined();

    expect(
      asResetOriginsReply({
        tag: listTag,
        kind: 'reset-origins',
        origins: ['https://a.example', 3],
      }),
    ).toStrictEqual({
      tag: listTag,
      kind: 'reset-origins',
      origins: ['https://a.example'],
    });
  });
});
