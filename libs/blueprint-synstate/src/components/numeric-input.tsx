import { createState, onScopeDispose } from 'synstate';
import { constant, toObservable, type Bindable, type JSX } from 'synstate-dom';
import type { StrictOmit } from 'ts-type-forge';
import {
  classObject,
  createAfterUpdate,
  intentClass,
  sizeClass,
  subscribeInScope,
} from '../internal/index.mjs';
import { Icon } from './icon.js';
import type { Intent, Size } from './intent.mjs';

type ViewProps = Readonly<{
  /** The text in the input, as the user is typing it. */
  value: Bindable<string>;
  /** Called with the text on every keystroke. */
  onValueChange: (text: string) => void;
  /** Called when the input loses focus: where the text is committed. */
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  /** Called when the up button is pressed, before it is released. */
  onIncrementMouseDown?: (event: MouseEvent) => void;
  /** Called when the down button is pressed, before it is released. */
  onDecrementMouseDown?: (event: MouseEvent) => void;
  /**
   * Called when the up button is clicked: after a mouse press is released,
   * or by Enter or Space on the focused button (`event.detail` is 0).
   */
  onIncrementClick?: (event: MouseEvent) => void;
  /** As `onIncrementClick`, for the down button. */
  onDecrementClick?: (event: MouseEvent) => void;
  disabled?: Bindable<boolean>;
  placeholder?: Bindable<string>;
  /** Selects the whole text when the input gains focus. */
  selectAllOnFocus?: boolean;
  intent?: Intent;
  size?: Size;
  /** Takes the width of its container (`bp6-fill`). */
  fill?: boolean;
  /** Classes after Blueprint's own on the wrapper. */
  class?: string;
  /** Classes after `bp6-input` on the `<input>`, as `inputClassName`. */
  inputClass?: string;
  'aria-label'?: Bindable<string>;
  /** On the `<input>`. */
  'data-e2e'?: Bindable<string | undefined>;
}>;

/**
 * Blueprint's `NumericInput`, drawn and nothing more: the text input with the
 * up and down buttons beside it, in Blueprint's markup.
 *
 * Its value is the **text**, and it holds no state: what it shows is `value`,
 * and every keystroke goes to `onValueChange` as a string. A number-typed
 * value would collapse what the user is half way through typing — `-`,
 * `3.`, `1e` — into `NaN` or a rounded number on the next keystroke and get
 * in the way of typing it; the text is turned into a number only when it is
 * committed, by whoever holds the state. {@link NumericInput} is that layer
 * for a number value.
 */
export const NumericInputView = ({
  value,
  onValueChange,
  onBlur,
  onKeyDown,
  onIncrementMouseDown,
  onDecrementMouseDown,
  onIncrementClick,
  onDecrementClick,
  disabled,
  placeholder,
  selectAllOnFocus = false,
  intent = 'none',
  size = 'medium',
  fill = false,
  class: className,
  inputClass,
  'aria-label': ariaLabel,
  'data-e2e': e2e,
}: ViewProps): JSX.Element => (
  <div
    class={classObject([
      'bp6-control-group',
      'bp6-numeric-input',
      sizeClass(size),
      fill && 'bp6-fill',
      className,
    ])}
  >
    <div
      class={classObject(
        ['bp6-input-group', intentClass(intent), fill && 'bp6-fill'],
        [['bp6-disabled', disabled]],
      )}
    >
      <input
        aria-label={ariaLabel}
        autocomplete={constant('off')}
        class={classObject(['bp6-input', inputClass])}
        data-e2e={e2e}
        disabled={disabled}
        placeholder={placeholder}
        type={constant('text')}
        value={value}
        onBlur={() => {
          onBlur?.();
        }}
        onFocus={(event) => {
          if (selectAllOnFocus) {
            event.currentTarget.select();
          }
        }}
        onInput={(event) => {
          onValueChange(event.currentTarget.value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
        }}
      />
    </div>
    <div class={constant('bp6-button-group bp6-vertical bp6-fixed')}>
      <button
        aria-label={constant('increment')}
        class={classObject(['bp6-button', intentClass(intent)])}
        disabled={disabled}
        type={constant('button')}
        onClick={(event) => {
          onIncrementClick?.(event);
        }}
        onMouseDown={(event) => {
          onIncrementMouseDown?.(event);
        }}
      >
        <Icon icon={'chevron-up'} />
      </button>
      <button
        aria-label={constant('decrement')}
        class={classObject(['bp6-button', intentClass(intent)])}
        disabled={disabled}
        type={constant('button')}
        onClick={(event) => {
          onDecrementClick?.(event);
        }}
        onMouseDown={(event) => {
          onDecrementMouseDown?.(event);
        }}
      >
        <Icon icon={'chevron-down'} />
      </button>
    </div>
  </div>
);

type Props<N extends number> = Readonly<
  {
    /**
     * The value from outside. The text is written afresh from it whenever
     * it changes, and is otherwise the component's own.
     */
    value: Bindable<N>;
    /**
     * Called with the committed value — on blur, on Enter, and on every
     * step of the buttons and the arrow keys — when it differs from
     * `value`.
     */
    onValueChange: (value: N) => void;
    /** The text a value is shown as. */
    encode: (value: N) => string;
    /**
     * The number a text stands for; `NaN` for none, which `normalize` mends.
     * A step from such a text starts from `normalize(NaN)`.
     */
    decode: (text: string) => number;
    /** The value a number is committed as: clamped, rounded, `NaN` replaced. */
    normalize: (value: number) => N;
    /** What a button or an arrow key adds or takes away; 1 by default. */
    step?: number;
  } & StrictOmit<
    ViewProps,
    | 'onBlur'
    | 'onDecrementClick'
    | 'onDecrementMouseDown'
    | 'onIncrementClick'
    | 'onIncrementMouseDown'
    | 'onKeyDown'
    | 'onValueChange'
    | 'value'
  >
>;

/**
 * Blueprint's `NumericInput` for a number value: {@link NumericInputView}
 * with the text kept here, uncontrolled while the user types.
 *
 * Nothing the user types is decoded until it is committed — on blur, on
 * Enter, or by a step — so half-typed text such as `-` or `3.` stays as it
 * is; only then does `decode` read it and `normalize` make it a value, the
 * text is rewritten from that value, and `onValueChange` is told. Holding a
 * button with the main mouse button, or an arrow key, steps again after
 * 400 ms, then every 40 ms, until it is released, the window loses focus
 * (and for a key, the input) or a bound stops the value; Enter or Space on
 * a focused button steps once.
 *
 * This split, stateless text in the view and the state that decodes it here,
 * is how every numeric input in this repository is built (see
 * `articles/numeric-input-interface.md`): a controlled input whose value is a
 * number cannot hold text that is not yet one.
 */
export const NumericInput = <N extends number>({
  value,
  onValueChange,
  encode,
  decode,
  normalize,
  step = 1,
  ...viewProps
}: Props<N>): JSX.Element => {
  const value$ = toObservable(value);

  const [text$, setText] = createState(encode(value$.getSnapshot().value));

  const afterUpdate = createAfterUpdate();

  // Whether the value has been read once: the first call is the value the
  // text was made from.
  let mut_following = false;

  // A state is not written while another is still propagating, so the text
  // follows the value once the update that brought it has finished.
  subscribeInScope(value$, (current) => {
    if (mut_following) {
      afterUpdate(() => {
        setText(encode(current));
      });
    }
  });

  mut_following = true;

  /** Commits the text plus `delta`; `false` when that is no other number, as at a bound. */
  const commit = (delta: number): boolean => {
    const decoded = decode(text$.getSnapshot().value);

    const next = normalize(
      (Number.isNaN(decoded) ? normalize(Number.NaN) : decoded) + delta,
    );

    setText(encode(next));

    if (next !== value$.getSnapshot().value) {
      onValueChange(next);
    }

    return next !== decoded;
  };

  const repeat = createRepeat(commit);

  onScopeDispose(repeat.stop);

  // A disabled button gets no release in every browser.
  if (viewProps.disabled !== undefined) {
    subscribeInScope(toObservable(viewProps.disabled), (disabled) => {
      if (disabled) {
        repeat.stop();
      }
    });
  }

  // Whether the click to come ends a press that has stepped already: a
  // click steps only when it was not, as with Enter or Space on the button.
  // The click comes in the same task as the release, so `stepped` is
  // cleared in the frame after the release, or after the window's blur that
  // takes the release away, unless another press has come since.
  const mut_press = { count: 0, stepped: false };

  const onStepMouseDown = (event: MouseEvent, delta: number): void => {
    mut_press.count += 1;

    // Only the main button, and not the Ctrl+click that opens the context
    // menu on macOS: a menu takes the release that ends the repeat.
    mut_press.stepped = event.button === 0 && !event.ctrlKey;

    if (!mut_press.stepped) {
      return;
    }

    repeat.start(delta, { kind: 'mouse' }, event);

    const press = mut_press.count;

    const doc = event.view?.document ?? document;

    const onRelease = (): void => {
      doc.removeEventListener('mouseup', onRelease);

      doc.defaultView?.removeEventListener('blur', onRelease);

      requestAnimationFrame(() => {
        if (mut_press.count === press) {
          mut_press.stepped = false;
        }
      });
    };

    doc.addEventListener('mouseup', onRelease);

    doc.defaultView?.addEventListener('blur', onRelease);
  };

  const onStepClick = (delta: number): void => {
    if (mut_press.stepped) {
      mut_press.stepped = false;
    } else {
      commit(delta);
    }
  };

  return (
    <NumericInputView
      {...viewProps}
      value={text$}
      onBlur={() => {
        // A held arrow key needs the focus; a held button has just taken it.
        repeat.stopKey();

        commit(0);
      }}
      onDecrementClick={() => {
        onStepClick(-step);
      }}
      onDecrementMouseDown={(event) => {
        onStepMouseDown(event, -step);
      }}
      onIncrementClick={() => {
        onStepClick(step);
      }}
      onIncrementMouseDown={(event) => {
        onStepMouseDown(event, step);
      }}
      onKeyDown={(event) => {
        // Keys that pick or confirm what an input method is composing:
        // Safari sends the Enter that confirms a composition after
        // `compositionend`, told from others by its key code alone.
        if (
          event.isComposing ||
          // eslint-disable-next-line @typescript-eslint/no-deprecated, unicorn/prefer-keyboard-event-key -- see above
          (event.key === 'Enter' && event.keyCode === imeKeyCode)
        ) {
          return;
        }

        switch (event.key) {
          case 'ArrowUp':
          case 'ArrowDown':
            // With Cmd or Ctrl, the caret moves to an end as it does
            // elsewhere. Only on the first keydown: the modifier pressed
            // while a step is held moves nothing.
            if (!event.repeat && (event.metaKey || event.ctrlKey)) {
              break;
            }

            // Kept from moving the caret, as in Blueprint's; a held key
            // repeats by the timers, not by the key's own repeats.
            event.preventDefault();

            if (!event.repeat) {
              repeat.start(
                event.key === 'ArrowUp' ? step : -step,
                { kind: 'key', code: event.code },
                event,
              );
            }

            break;

          case 'Enter':
            commit(0);

            break;

          default:
            break;
        }
      }}
      onValueChange={setText}
    />
  );
};

/**
 * What ends a held step: the mouse button's release, or the key's, told by
 * its `code`, which NumLock or Shift cannot change between press and release.
 */
type Release = Readonly<{ kind: 'mouse' } | { kind: 'key'; code: string }>;

/** The key code of a key down that an input method takes. */
const imeKeyCode = 229;

const repeatDelayMs = 400;

const repeatIntervalMs = 40;

/**
 * Steps once at `start`, then again after 400 ms and every 40 ms, until
 * `stop`: called on the release `start` names, on the blur of the window,
 * which takes the release away, and when a step changes nothing, as at a
 * bound. A key's release is also a release of Meta, which on macOS keeps
 * the other keys' `keyup` from being sent. The listeners are on the
 * document the press happened in, and only while a step is held.
 */
const createRepeat = (
  step: (delta: number) => boolean,
): Readonly<{
  start: (delta: number, release: Release, event: UIEvent) => void;
  stop: () => void;
  /** Stops a repeat held by a key, and leaves one held by the mouse. */
  stopKey: () => void;
}> => {
  const mut_held: {
    delay: ReturnType<typeof setTimeout> | undefined;
    interval: ReturnType<typeof setInterval> | undefined;
    release: Release | undefined;
    document: Document | undefined;
  } = {
    delay: undefined,
    interval: undefined,
    release: undefined,
    document: undefined,
  };

  const onKeyUp = (event: KeyboardEvent): void => {
    if (
      mut_held.release?.kind === 'key' &&
      (event.code === mut_held.release.code || event.key === 'Meta')
    ) {
      stop();
    }
  };

  const stop = (): void => {
    clearTimeout(mut_held.delay);

    clearInterval(mut_held.interval);

    mut_held.release = undefined;

    // Removing a listener that was not added does nothing.
    mut_held.document?.removeEventListener('mouseup', stop);

    mut_held.document?.removeEventListener('keyup', onKeyUp);

    mut_held.document?.defaultView?.removeEventListener('blur', stop);

    mut_held.document = undefined;
  };

  const start = (delta: number, release: Release, event: UIEvent): void => {
    stop();

    // A bound reached stops the repeat, as in Blueprint's.
    if (!step(delta)) {
      return;
    }

    const doc = event.view?.document ?? document;

    mut_held.release = release;

    mut_held.document = doc;

    if (release.kind === 'mouse') {
      doc.addEventListener('mouseup', stop);
    } else {
      doc.addEventListener('keyup', onKeyUp);
    }

    doc.defaultView?.addEventListener('blur', stop);

    mut_held.delay = setTimeout(() => {
      mut_held.interval = setInterval(() => {
        if (!step(delta)) {
          stop();
        }
      }, repeatIntervalMs);
    }, repeatDelayMs);
  };

  const stopKey = (): void => {
    if (mut_held.release?.kind === 'key') {
      stop();
    }
  };

  return { start, stop, stopKey };
};
