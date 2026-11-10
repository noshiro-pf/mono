import {
  createPane,
  initialPaneLoad,
  loadKeyOf,
  maxAutomaticClears,
  paneLoadReducer,
  paneLoadView,
  type PaneLoad,
  type PaneLoadEvent,
} from '../src/index.mjs';

const pane = createPane(0, 'https://a.example/');

const key = loadKeyOf(pane);

const run = (
  events: readonly PaneLoadEvent[],
  from: PaneLoad = initialPaneLoad(key),
): PaneLoad => events.reduce(paneLoadReducer, from);

describe('pane load', () => {
  test('a frame that reports is not blocked', () => {
    const state = run([
      { type: 'frame-load' },
      { type: 'report' },
      { type: 'grace-elapsed', frameLoads: 1 },
      { type: 'waited-out', loadSerial: 0 },
    ]);

    expect(paneLoadView(state, pane, [])).toMatchObject({
      blocked: false,
      frameAnswers: true,
      showFallback: false,
    });
  });

  test('a load with no report within the grace is blocked by the site', () => {
    const state = run([
      { type: 'frame-load' },
      { type: 'grace-elapsed', frameLoads: 1 },
    ]);

    expect(paneLoadView(state, pane, [])).toMatchObject({
      blocked: true,
      blockedBySite: true,
      canRetry: true,
      showFallback: true,
      target: 'https://a.example/',
      siteOrigin: 'https://a.example',
    });
  });

  test('a grace timer from an earlier load event is ignored', () => {
    const state = run([
      { type: 'frame-load' },
      { type: 'frame-load' },
      { type: 'grace-elapsed', frameLoads: 1 },
    ]);

    expect(state.silent).toBe(false);
  });

  test('ten seconds with no load event at all also blocks', () => {
    expect(
      paneLoadView(run([{ type: 'waited-out', loadSerial: 0 }]), pane, [])
        .blocked,
    ).toBe(true);

    expect(run([{ type: 'waited-out', loadSerial: 1 }]).waitedOut).toBe(false);
  });

  test("a new document's load starts its own grace", () => {
    const state = run([
      { type: 'frame-load' },
      { type: 'grace-elapsed', frameLoads: 1 },
      { type: 'dismiss' },
      { type: 'frame-load' },
    ]);

    expect(paneLoadView(state, pane, []).showFallback).toBe(false);
  });

  test('a timer left from an earlier load does not touch the next', () => {
    const elsewhere = `${key}#elsewhere` as const;

    // A → B within the grace: B's first `load` is not A's.
    const moved = run([
      { type: 'frame-load' },
      { type: 'load-key', loadKey: elsewhere },
      { type: 'frame-load' },
      { type: 'grace-elapsed', frameLoads: 1 },
    ]);

    expect(moved.silent).toBe(false);

    // A → B → A: the second load of A is not the first.
    const back = run([
      { type: 'load-key', loadKey: elsewhere },
      { type: 'load-key', loadKey: key },
      { type: 'waited-out', loadSerial: 0 },
    ]);

    expect(back.waitedOut).toBe(false);
  });

  test('a refused address is blocked by the browser, not the site', () => {
    const chrome = createPane(1, 'chrome://settings');

    expect(
      paneLoadView(initialPaneLoad(loadKeyOf(chrome)), chrome, []),
    ).toMatchObject({
      refusal: 'browser-page',
      blocked: true,
      blockedBySite: false,
      canRetry: false,
    });
  });

  test('an empty pane is never blocked', () => {
    const empty = createPane(2);

    expect(
      paneLoadView(
        run(
          [{ type: 'waited-out', loadSerial: 0 }],
          initialPaneLoad(loadKeyOf(empty)),
        ),
        empty,
        [],
      ).blocked,
    ).toBe(false);
  });

  test('a link leaving for a blocked site moves the fallback to it', () => {
    const state = run([
      { type: 'frame-load' },
      { type: 'report' },
      { type: 'leaving', url: 'https://b.example/page' },
      { type: 'frame-load' },
      { type: 'grace-elapsed', frameLoads: 2 },
    ]);

    expect(paneLoadView(state, pane, [])).toMatchObject({
      blocked: true,
      canRetry: false,
      target: 'https://b.example/page',
      siteOrigin: 'https://b.example',
    });
  });

  test('dismiss hides the fallback until the next document', () => {
    const blocked = run([
      { type: 'frame-load' },
      { type: 'grace-elapsed', frameLoads: 1 },
      { type: 'dismiss' },
    ]);

    expect(paneLoadView(blocked, pane, []).showFallback).toBe(false);

    expect(
      paneLoadView(
        run(
          [{ type: 'frame-load' }, { type: 'grace-elapsed', frameLoads: 2 }],
          blocked,
        ),
        pane,
        [],
      ).showFallback,
    ).toBe(true);
  });

  test('automatic clears are budgeted and survive the reloads they cause', () => {
    const origins = ['https://a.example'] as const;

    const blocked = run([
      { type: 'frame-load' },
      { type: 'grace-elapsed', frameLoads: 1 },
    ]);

    expect(paneLoadView(blocked, pane, origins)).toMatchObject({
      alwaysClear: true,
      shouldClearAutomatically: true,
      showFallback: false,
    });

    const clearing = paneLoadReducer(blocked, {
      type: 'clear-workers',
      origin: 'https://a.example',
      automatic: true,
    });

    expect(clearing.helper).toStrictEqual({
      url: 'https://a.example/',
      serial: 1,
    });

    expect(paneLoadView(clearing, pane, origins)).toMatchObject({
      shouldClearAutomatically: false,
      showFallback: false,
    });

    const exhausted = Array.from({
      length: maxAutomaticClears,
    }).reduce<PaneLoad>(
      (state, _, index) =>
        run(
          [
            { type: 'load-key', loadKey: `${key}#${index.toString()}` },
            {
              type: 'clear-workers',
              origin: 'https://a.example',
              automatic: true,
            },
            { type: 'workers-removed', count: 1 },
            { type: 'load-key', loadKey: `${key}#again${index.toString()}` },
            { type: 'frame-load' },
            // Counted across loads: this is the pane's (index + 1)-th.
            { type: 'grace-elapsed', frameLoads: index + 1 },
          ],
          state,
        ),
      initialPaneLoad(key),
    );

    expect(exhausted.automaticClears).toBe(maxAutomaticClears);

    expect(paneLoadView(exhausted, pane, origins)).toMatchObject({
      shouldClearAutomatically: false,
      showFallback: true,
    });

    expect(paneLoadReducer(exhausted, { type: 'report' }).automaticClears).toBe(
      0,
    );
  });

  test('a stale helper timeout is ignored', () => {
    const clearing = run([
      { type: 'clear-workers', origin: 'https://a.example', automatic: false },
      { type: 'clear-workers', origin: 'https://a.example', automatic: false },
    ]);

    expect(
      paneLoadReducer(clearing, { type: 'helper-timeout', serial: 1 }),
    ).toBe(clearing);

    expect(
      paneLoadReducer(clearing, { type: 'helper-timeout', serial: 2 }).helper,
    ).toBeUndefined();
  });

  test('a repeated report changes nothing', () => {
    const answered = run([{ type: 'frame-load' }, { type: 'report' }]);

    expect(paneLoadReducer(answered, { type: 'report' })).toBe(answered);
  });
});
