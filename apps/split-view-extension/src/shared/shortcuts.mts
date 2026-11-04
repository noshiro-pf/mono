import { Num, Result } from 'ts-data-forge';

/**
 * The part of a `WheelEvent` the zoom test reads.
 *
 * Structural for the same reason as `ShortcutKeyEvent` below.
 */
export type ZoomWheelEvent = Readonly<{
  ctrlKey: boolean;
  deltaY: number;
  preventDefault: () => void;
}>;

/**
 * Whether a wheel turn is a zoom, and which way.
 *
 * `Ctrl` with the wheel, which is what a browser zooms with — and what Chrome
 * reports a trackpad pinch as, so pinching a pane zooms it too. The listener
 * has to be a non-passive one and call `preventDefault`, or the browser zooms
 * the whole tab as well.
 */
export const zoomStepFromWheel = (
  wheelEvent: ZoomWheelEvent,
): 'in' | 'out' | undefined =>
  wheelEvent.ctrlKey
    ? wheelEvent.deltaY < 0
      ? 'in'
      : wheelEvent.deltaY > 0
        ? 'out'
        : undefined
    : undefined;

/**
 * The part of a `KeyboardEvent` the shortcut test reads.
 *
 * Structural rather than `KeyboardEvent` itself for the reason given on
 * `IncomingMessageEvent`: a parameter has to be deeply readonly here, and a DOM
 * event is mutable all the way down.
 */
export type ShortcutKeyEvent = Readonly<{
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  key: string;
  code: string;
  defaultPrevented: boolean;
  preventDefault: () => void;
}>;

/**
 * Whether a keydown is one of the split view's own shortcuts, and if so which
 * key it was.
 *
 * `Alt` alone, with 1 through 9: Chrome's own bindings for those digits are on
 * `Ctrl` (`Cmd` on macOS), so nothing is taken away from the browser, and the
 * page needs no `commands` entry in the manifest and no permission for it.
 *
 * It reads `code`, never `key`: on macOS `Alt+1` *types* `¡`, so `key` says
 * what the key produced rather than which key it was. `code` is the physical
 * digit on every layout.
 */
export const workspaceShortcutCodeOf = (
  keyEvent: ShortcutKeyEvent,
): string | undefined =>
  keyEvent.altKey &&
  !keyEvent.ctrlKey &&
  !keyEvent.metaKey &&
  !keyEvent.shiftKey &&
  digitCodePattern.test(keyEvent.code)
    ? keyEvent.code
    : undefined;

/**
 * Whether a keydown is the browser's reload: `Ctrl+R` (`Cmd+R` on macOS) or
 * `F5`, with `Shift` or `Ctrl` for the hard reload or without.
 *
 * Pressed inside a pane, Chrome would reload the whole tab — every pane, and
 * the split view with them — so the frame agent takes it and reloads its own
 * pane instead. Chrome lets a page keep this one from the browser with
 * `preventDefault`, even from inside a cross-origin frame; `Ctrl+W` and
 * `Ctrl+T` it does not.
 *
 * The letter is read from `key`, as Chrome reads it, so that on Dvorak it is
 * the key that types R, and the one that types P stays print. Only a layout
 * that types no Latin letter there falls back to `code`, the physical key,
 * which is what Chrome does too.
 */
export const isReloadShortcut = (keyEvent: ShortcutKeyEvent): boolean => {
  if (keyEvent.altKey) {
    return false;
  }

  if (keyEvent.code === 'F5') {
    return !keyEvent.metaKey;
  }

  const isR = latinLetterPattern.test(keyEvent.key)
    ? keyEvent.key.toLowerCase() === 'r'
    : keyEvent.code === 'KeyR';

  return isR && (keyEvent.ctrlKey || keyEvent.metaKey);
};

/** A key a pane takes from the browser, as `paneKeyOf` names it. */
export type PaneKey = Readonly<
  { kind: 'reload' } | { kind: 'workspace'; code: string }
>;

/**
 * Which of the keys a pane takes a keydown is, if any: the reload shortcut or a
 * workspace shortcut, unless the site has already taken it.
 */
export const paneKeyOf = (keyEvent: ShortcutKeyEvent): PaneKey | undefined => {
  if (keyEvent.defaultPrevented) {
    return undefined;
  }

  if (isReloadShortcut(keyEvent)) {
    return { kind: 'reload' };
  }

  const code = workspaceShortcutCodeOf(keyEvent);

  return code === undefined ? undefined : { kind: 'workspace', code };
};

/**
 * What a frame not assigned a pane does with one of the keys a pane takes, by
 * where it is. An assigned frame acts on the key itself.
 *
 * Only the pane's own frame is assigned a pane, so a frame nested in a pane's
 * page hands the key up, and the nearest frame up the chain that is a pane acts
 * on it. The pane's own frame reloads itself even before the page has assigned
 * it, since that needs no one's answer; a frame directly in the split view page
 * that is not named as a pane is not one, and leaves the key alone.
 */
export const paneKeyRoute = (
  frame: Readonly<{
    parentIsSplitPage: boolean;
    namedAsPane: boolean;
  }>,
  key: PaneKey,
): PaneKeyRoute =>
  !frame.parentIsSplitPage
    ? 'hand-up'
    : key.kind === 'reload' && frame.namedAsPane
      ? 'reload-self'
      : 'leave';

/** The 1-based workspace position a shortcut names. */
export const workspacePositionFromCode = (code: string): number | undefined => {
  const digit = digitCodePattern.exec(code)?.[1];

  return digit === undefined
    ? undefined
    : Result.unwrapOkOr(Num.safeParseInt(digit), Number.NaN);
};

/**
 * What a frame not assigned a pane does with one of the keys a pane takes:
 * `reload-self` as a pane the page has not assigned yet, `hand-up` to the frame
 * that contains this one, or `leave` it to the browser.
 */
export type PaneKeyRoute = 'reload-self' | 'hand-up' | 'leave';

const digitCodePattern = /^Digit([1-9])$/u;

const latinLetterPattern = /^[a-z]$/iu;
