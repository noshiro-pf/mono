import { Num, Result } from 'ts-data-forge';
import type { PaneKey } from './protocol.mjs';

/** The part of a `KeyboardEvent` read here; a DOM event is mutable throughout. */
export type KeyLike = Readonly<{
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  key: string;
  code: string;
  defaultPrevented: boolean;
}>;

/**
 * The `KeyboardEvent.code` of `Alt+1`..`Alt+9` (spec W2), or `undefined`.
 * `code`, never `key`: on macOS `Alt+1` types `¡`. Chrome's own digit bindings
 * are on `Ctrl`/`Cmd`, so nothing is taken from the browser.
 */
export const workspaceShortcutOf = (event: KeyLike): string | undefined =>
  event.altKey &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.shiftKey &&
  digitCodePattern.test(event.code)
    ? event.code
    : undefined;

/** The 1-based position a shortcut's code names. */
export const positionOfShortcut = (code: string): number | undefined => {
  const digit = digitCodePattern.exec(code)?.[1];

  return digit === undefined
    ? undefined
    : Result.unwrapOkOr(Num.safeParseInt(digit), Number.NaN);
};

/**
 * `Ctrl+R`, `Cmd+R` or `F5`, hard or not (spec A3). The letter is read from
 * `key` as Chrome reads it, so on Dvorak it is the key that types R; a layout
 * that types no Latin letter falls back to the physical key.
 */
export const isReloadKey = (event: KeyLike): boolean => {
  if (event.altKey) {
    return false;
  }

  if (event.code === 'F5') {
    return !event.metaKey;
  }

  const isR = /^[a-z]$/iu.test(event.key)
    ? event.key.toLowerCase() === 'r'
    : event.code === 'KeyR';

  return isR && (event.ctrlKey || event.metaKey);
};

/** Which key a pane takes, unless the site already took it. */
export const paneKeyOf = (event: KeyLike): PaneKey | undefined => {
  if (event.defaultPrevented) {
    return undefined;
  }

  if (isReloadKey(event)) {
    return { kind: 'reload' };
  }

  const code = workspaceShortcutOf(event);

  return code === undefined ? undefined : { kind: 'workspace', code };
};

/**
 * What a frame not yet assigned a pane does with such a key: a frame nested in
 * a pane's page hands it up; a pane's own frame reloads itself, which needs no
 * answer from the page; any other frame leaves it to the browser.
 */
export const unassignedKeyRoute = (
  frame: Readonly<{ parentIsSplitPage: boolean; namedAsPane: boolean }>,
  key: PaneKey,
): 'hand-up' | 'leave' | 'reload-self' =>
  !frame.parentIsSplitPage
    ? 'hand-up'
    : key.kind === 'reload' && frame.namedAsPane
      ? 'reload-self'
      : 'leave';

/**
 * Whether a wheel event is the pane's to zoom by (and to prevent): `Ctrl` held
 * and a vertical delta. A horizontal one with `Ctrl` is left to the site.
 */
export const isZoomWheel = (
  event: Readonly<{ ctrlKey: boolean; deltaY: number }>,
): boolean => event.ctrlKey && event.deltaY !== 0;

/**
 * `Ctrl`+wheel as a zoom step. A trackpad pinch, which Chrome reports as a
 * burst of `Ctrl`+wheel events, steps at most every `wheelStepGapMs` rather
 * than once per event; turning the other way steps at once. Counted in time
 * rather than in `deltaY`, whose size depends on the platform and on the pane's
 * own zoom. `last` is kept by the caller.
 */
export const wheelZoomStep = (
  last: WheelZoomStep | undefined,
  event: Readonly<{ ctrlKey: boolean; deltaY: number; timeStamp: number }>,
): Readonly<{
  last: WheelZoomStep | undefined;
  step: 'in' | 'out' | undefined;
}> => {
  if (!isZoomWheel(event)) {
    return { last, step: undefined };
  }

  const step = event.deltaY < 0 ? 'in' : 'out';

  return last?.step === step && event.timeStamp - last.at < wheelStepGapMs
    ? { last, step: undefined }
    : { last: { at: event.timeStamp, step }, step };
};

/** The last zoom step a wheel took: when, in `timeStamp` time, and which way. */
export type WheelZoomStep = Readonly<{ at: number; step: 'in' | 'out' }>;

/**
 * Short enough that wheel notches spun quickly each count, long enough that a
 * pinch does not race to the end of the zoom ladder.
 */
const wheelStepGapMs = 60;

const digitCodePattern = /^Digit([1-9])$/u;
