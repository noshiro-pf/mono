/**
 * The part of a `WheelEvent` the zoom test reads.
 *
 * Structural for the same reason as `ShortcutKeyEvent` below.
 */
/**
 * The part of a `KeyboardEvent` the shortcut test reads.
 *
 * Structural rather than `KeyboardEvent` itself for the reason given on
 * `IncomingMessageEvent`: a parameter has to be deeply readonly here, and a DOM
 * event is mutable all the way down.
 */
import { Num, Result } from 'ts-data-forge';

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

/** The 1-based workspace position a shortcut names. */
export const workspacePositionFromCode = (code: string): number | undefined => {
  const digit = digitCodePattern.exec(code)?.[1];

  return digit === undefined
    ? undefined
    : Result.unwrapOkOr(Num.safeParseInt(digit), Number.NaN);
};

const digitCodePattern = /^Digit([1-9])$/u;

const latinLetterPattern = /^[a-z]$/iu;
