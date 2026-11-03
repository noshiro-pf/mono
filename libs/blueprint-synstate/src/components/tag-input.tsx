import { createState, map, onScopeDispose } from 'synstate';
import {
  constant,
  derive,
  For,
  isImeKeyDown,
  mapBindable,
  toObservable,
  view,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import { Arr, Num } from 'ts-data-forge';
import { classObject, intentClass } from '../internal/index.mjs';
import { Icon, type IconName } from './icon.js';
import type { Intent } from './intent.mjs';
import { Tag } from './tag.js';

/** A tag a {@link TagInput} draws: what Blueprint's `tagProps` gives each. */
export type TagInputValue = Readonly<{
  value: string;
  intent?: Intent;
  minimal?: boolean;
  /**
   * Called by its remove button in place of the input's `onRemove`, as an
   * `onRemove` in Blueprint's `tagProps` is; Backspace and Delete still call
   * the input's.
   */
  onRemove?: () => void;
}>;

/** How a {@link TagInput}'s new values were entered: Blueprint's `TagInputAddMethod`. */
export type TagInputAddMethod = 'blur' | 'default' | 'paste';

type Props = Readonly<{
  values: Bindable<readonly TagInputValue[]>;
  /**
   * Asked to add what was entered, split on `separator`, trimmed and with the
   * empty ones left out: none at all for a separator alone, as in Blueprint.
   */
  onAdd?: (values: readonly string[], method: TagInputAddMethod) => void;
  /** Asked to remove a tag that has no `onRemove` of its own. */
  onRemove?: (value: string, index: number) => void;
  /** Splits what is entered into values; `false` keeps it whole. */
  separator?: RegExp | false;
  /** What was entered is added as focus leaves; off by default. */
  addOnBlur?: boolean;
  /** What is pasted with a separator in it is added; on by default. */
  addOnPaste?: boolean;
  /** Shown while there is no tag. */
  placeholder?: string;
  leftIcon?: IconName;
  /** After the tags, as a clear button. */
  rightElement?: Child;
  disabled?: Bindable<boolean>;
  intent?: Intent;
  /** Takes the width of its container (`bp6-fill`). */
  fill?: boolean;
  /** Classes after Blueprint's own. */
  class?: string;
  'data-e2e'?: string;
}>;

/**
 * Blueprint's `TagInput`, at its medium size: tags and a text input in
 * `div.bp6-input.bp6-tag-input`.
 * Enter adds what was typed; at the start of the input, the arrow keys move
 * from tag to tag, and Backspace and Delete remove the one moved to.
 */
export const TagInput = ({
  values,
  onAdd,
  onRemove,
  separator = /[,\n\r]/u,
  addOnBlur = false,
  addOnPaste = true,
  placeholder,
  leftIcon,
  rightElement,
  disabled = constant(false),
  intent = 'none',
  fill = false,
  class: className,
  'data-e2e': e2e,
}: Props): JSX.Element => {
  const values$ = toObservable(values);

  const disabled$ = toObservable(disabled);

  const [activeIndex$, setActiveIndex] = createState<number | undefined>(
    undefined,
  );

  const [isInputFocused$, setIsInputFocused] = createState(false);

  const mut_state: {
    input: HTMLInputElement | undefined;
    blurFrame: number;
  } = { input: undefined, blurFrame: 0 };

  onScopeDispose(() => {
    cancelAnimationFrame(mut_state.blurFrame);
  });

  const valuesOf = (text: string): readonly string[] =>
    (separator === false ? [text] : text.split(separator))
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

  const addTags = (text: string, method: TagInputAddMethod): void => {
    onAdd?.(valuesOf(text), method);

    if (mut_state.input !== undefined) {
      mut_state.input.value = '';
    }
  };

  /** Blueprint's `removeIndexFromValues`, which Backspace and Delete call. */
  const removeAt = (index: number): void => {
    const tag = values$.getSnapshot().value[index];

    if (tag !== undefined) {
      onRemove?.(tag.value, index);
    }
  };

  /** Blueprint's `getNextActiveIndex`. */
  const nextActiveIndex = (direction: -1 | 1): number | undefined => {
    const active = activeIndex$.getSnapshot().value;

    const { length } = values$.getSnapshot().value;

    if (active === undefined) {
      return direction < 0 ? Num.clamp(length - 1, 0, length) : undefined;
    }

    return Num.clamp(active + direction, 0, length);
  };

  const isValidIndex = (index: number | undefined): index is number =>
    index !== undefined && index < values$.getSnapshot().value.length;

  const onKeyDown = (
    event: KeyboardEvent & Readonly<{ currentTarget: HTMLInputElement }>,
  ): void => {
    const { selectionEnd, value } = event.currentTarget;

    if (event.key === 'Enter' && !isImeKeyDown(event) && value.length > 0) {
      addTags(value, 'default');

      return;
    }

    if (selectionEnd !== 0 || !Arr.isNonEmpty(values$.getSnapshot().value)) {
      return;
    }

    const active = activeIndex$.getSnapshot().value;

    const direction =
      event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;

    if (direction !== 0) {
      const next = nextActiveIndex(direction);

      if (next !== active) {
        event.stopPropagation();

        setActiveIndex(next);
      }
    } else if (event.key === 'Backspace') {
      setActiveIndex(nextActiveIndex(-1));

      if (isValidIndex(active)) {
        event.stopPropagation();

        removeAt(active);
      }
    } else if (event.key === 'Delete' && isValidIndex(active)) {
      event.stopPropagation();

      removeAt(active);
    }
  };

  const hasTag$ = values$.pipe(map(Arr.isNonEmpty));

  return (
    <div
      class={classObject(
        [
          'bp6-input',
          'bp6-tag-input',
          fill && 'bp6-fill',
          intentClass(intent),
          className,
        ],
        [
          ['bp6-active', isInputFocused$],
          ['bp6-disabled', disabled$],
        ],
      )}
      data-e2e={e2e === undefined ? undefined : constant(e2e)}
      onClick={() => {
        mut_state.input?.focus();
      }}
      // React's `onBlur`, which bubbles; it goes with the element.
      ref={(container) => {
        container.addEventListener('focusout', () => {
          cancelAnimationFrame(mut_state.blurFrame);

          mut_state.blurFrame = requestAnimationFrame(() => {
            if (container.contains(document.activeElement)) {
              return;
            }

            const text = mut_state.input?.value ?? '';

            if (addOnBlur && text.length > 0) {
              addTags(text, 'blur');
            }

            setActiveIndex(undefined);

            setIsInputFocused(false);
          });
        });
      }}
    >
      {leftIcon === undefined ? (
        []
      ) : (
        <Icon class={'bp6-tag-input-icon'} icon={leftIcon} />
      )}
      <div class={constant('bp6-tag-input-values')}>
        {/* Drawn afresh as a tag's look, or whether it may be removed, changes. */}
        <For
          items={derive([values$, disabled$], (tags, isDisabled) =>
            tags.map((tag) => ({ ...tag, removable: !isDisabled })),
          )}
          key={(tag, index) =>
            [
              tag.value,
              index,
              tag.intent ?? 'none',
              tag.minimal ?? false,
              tag.removable,
            ].join('__')
          }
        >
          {(tag$, index$) => {
            const {
              value,
              intent: tagIntent,
              minimal,
              removable,
            } = tag$.getSnapshot().value;

            // Part of the key, so that it is the same for the row's life.
            const index = index$.getSnapshot().value;

            return (
              <Tag
                active={mapBindable(activeIndex$, (active) => active === index)}
                intent={tagIntent ?? 'none'}
                minimal={minimal ?? false}
                {...(!removable
                  ? {}
                  : {
                      onRemove: () => {
                        // As it is now: a tag drawn again under the same key
                        // may bring another.
                        const onRemoveTag = tag$.getSnapshot().value.onRemove;

                        if (onRemoveTag === undefined) {
                          removeAt(index);
                        } else {
                          onRemoveTag();
                        }
                      },
                    })}
              >
                {constant(value)}
              </Tag>
            );
          }}
        </For>
        <input
          ref={(input) => {
            mut_state.input = input;
          }}
          class={constant('bp6-input-ghost')}
          disabled={disabled$}
          placeholder={
            placeholder === undefined
              ? undefined
              : view(hasTag$, (has) => (has ? undefined : placeholder))
          }
          onFocus={() => {
            setIsInputFocused(true);
          }}
          onInput={() => {
            setActiveIndex(undefined);
          }}
          onKeyDown={onKeyDown}
          onPaste={(event) => {
            const text = event.clipboardData?.getData('text') ?? '';

            if (
              !addOnPaste ||
              separator === false ||
              text.length === 0 ||
              Arr.isFixedLengthArray(1, text.split(separator))
            ) {
              return;
            }

            event.preventDefault();

            addTags(text, 'paste');
          }}
        />
      </div>
      {rightElement ?? []}
    </div>
  );
};
