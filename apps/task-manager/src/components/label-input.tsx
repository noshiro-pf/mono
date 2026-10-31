import {
  combine,
  createState,
  map,
  onScopeDispose,
  type InitializedObservable,
} from 'synstate';
import { constant, For, If, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { withLabelsAdded } from '../domain/index.mjs';
import { m } from '../i18n/index.mjs';
import {
  parseLabels,
  spellAsInUse,
  splitTypedLabels,
  suggestLabels,
} from '../view-model/index.mjs';
import { createAfterUpdate } from './scope-effects.mjs';

type Props = Readonly<{
  /** The caption of the field. */
  caption: string;
  /** Unique on the page: the box's id, and the start of its parts'. */
  id: string;
  /** The `data-e2e` of the box. */
  e2e: string;
  labels: InitializedObservable<readonly string[]>;
  /** The labels to suggest, in order (`labelsByUse`). */
  known: InitializedObservable<readonly string[]>;
  onChange: (labels: readonly string[]) => void;
}>;

/**
 * Labels, typed one at a time. Each one is a chip with a button that removes
 * it; a comma or Enter adds what is typed in the box, and so does submitting
 * the form, so that a label typed and not ended is still saved.
 * Backspace in the empty box removes the last chip. A label already there in
 * another case is not added again, and one typed that is in use in another case
 * is added as spelled in use. While something is typed, the labels in use that
 * start with it, then those that contain it, are listed under the box to choose
 * from — by the up and down keys and Enter, or by a tap — and Escape closes the
 * list.
 *
 * What an IME composes is not taken apart at a comma until it is ended.
 * The list is laid over the form, so that opening and closing it moves nothing a press may be on, and
 * is scrolled into view, above a phone's keyboard.
 */
export const LabelInput = ({
  caption,
  id,
  e2e,
  labels,
  known,
  onChange,
}: Props): JSX.Element => {
  const listId = `${id}-suggestions` as const;

  const optionId = (index: number): string =>
    `${id}-suggestion-${index}` as const;

  const afterUpdate = createAfterUpdate();

  const [typed$, setTyped] = createState('');

  // The suggestion the keys have moved to, if any — by its label, which stays
  // put as the labels in use change — and whether the list may be shown: while
  // the box has focus and Escape has not closed it.
  const [active$, setActive] = createState<string | undefined>(undefined);

  const [open$, setOpen] = createState(false);

  const suggestions$ = combine([known, labels, typed$]).pipe(
    map(([all, chosen, typed]) => suggestLabels(all, chosen, typed)),
  );

  const shown$ = combine([open$, suggestions$]).pipe(
    map(([open, suggestions]) => open && Arr.isNonEmpty(suggestions)),
  );

  const options$ = combine([suggestions$, active$]).pipe(
    map(([suggestions, active]) =>
      suggestions.map((label, index) => ({
        label,
        id: optionId(index),
        active: label === active,
      })),
    ),
  );

  let mut_box: HTMLInputElement | undefined = undefined;

  // What the last press in the box was made with: a click does not say in every
  // browser.
  let mut_pointerType = '';

  let mut_list: HTMLUListElement | undefined = undefined;

  /** What is being typed: `text`, in the box. */
  const retype = (text: string): void => {
    if (mut_box !== undefined && mut_box.value !== text) {
      mut_box.value = text;
    }

    setTyped(text);

    setActive(undefined);
  };

  const add = (added: readonly string[]): void => {
    const current = labels.getSnapshot().value;

    const next = withLabelsAdded(current, added);

    if (next.length !== current.length) {
      onChange(next);
    }
  };

  /**
   * Adds the labels a comma has ended, spelled as in use, and leaves the rest
   * in the box.
   */
  const follow = (text: string): void => {
    const { ended, rest } = splitTypedLabels(text);

    add(spellAsInUse(ended, known.getSnapshot().value));

    retype(rest);
  };

  /** Adds the labels of `text`, spelled as in use, and empties the box. */
  const commit = (text: string): void => {
    add(spellAsInUse(parseLabels(text), known.getSnapshot().value));

    retype('');
  };

  /** Adds `label`, as it is, and empties the box. */
  const choose = (label: string): void => {
    add([label]);

    retype('');
  };

  const remove = (label: string): void => {
    onChange(labels.getSnapshot().value.filter((each) => each !== label));
  };

  const close = (): void => {
    setOpen(false);

    setActive(undefined);
  };

  /**
   * As the focus leaves the box or the list for neither of them: the list
   * closes. Also as the box goes with the form: not while that is under way.
   */
  const onBlur = (left: FocusEvent): void => {
    if (
      left.relatedTarget instanceof Node &&
      (left.relatedTarget === mut_box ||
        mut_list?.contains(left.relatedTarget) === true)
    ) {
      return;
    }

    afterUpdate(close);
  };

  // What is typed is added when the form is submitted, before the form's own
  // handler saves it — a capturing listener on the target runs first —
  // however it is submitted: Enter in another box, a tap on 保存, or a key
  // an IME sends Enter as.
  const onSubmit = (): void => {
    if (mut_box !== undefined) {
      commit(mut_box.value);
    }
  };

  let mut_form: HTMLFormElement | undefined = undefined;

  afterUpdate(() => {
    mut_form = mut_box?.form ?? undefined;

    mut_form?.addEventListener('submit', onSubmit, { capture: true });
  });

  onScopeDispose(() => {
    mut_form?.removeEventListener('submit', onSubmit, { capture: true });
  });

  const onKeyDown = (
    pressed: KeyboardEvent & Readonly<{ currentTarget: HTMLInputElement }>,
  ): void => {
    // A key that ends an IME's composition is the IME's: Safari sends the
    // Enter that confirms one after `compositionend`, as key code 229 — which a
    // phone's keyboard may give its other keys too.
    if (
      pressed.isComposing ||
      (pressed.key === 'Enter' &&
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- Safari tells this key from others by its key code alone.
        pressed.keyCode === IME_KEY_CODE)
    ) {
      return;
    }

    const typed = pressed.currentTarget.value;

    const suggestions = suggestions$.getSnapshot().value;

    const active = active$.getSnapshot().value;

    const shown = shown$.getSnapshot().value;

    switch (pressed.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        if (!Arr.isNonEmpty(suggestions)) {
          return;
        }

        pressed.preventDefault();

        setOpen(true);

        const step = pressed.key === 'ArrowDown' ? 1 : -1;

        const count = Arr.length(suggestions);

        const at = active === undefined ? -1 : suggestions.indexOf(active);

        setActive(
          suggestions[
            at === -1
              ? step === 1
                ? 0
                : count - 1
              : (at + step + count) % count
          ],
        );

        return;
      }

      case 'Enter': {
        // Held down, the Enter that added a label does not go on to submit the
        // form; with nothing typed, Enter submits it as in any box.
        if (pressed.repeat) {
          pressed.preventDefault();

          return;
        }

        const chosen =
          active !== undefined && shown && suggestions.includes(active)
            ? active
            : undefined;

        if (chosen === undefined && typed.trim() === '') {
          return;
        }

        pressed.preventDefault();

        if (chosen === undefined) {
          commit(typed);
        } else {
          choose(chosen);
        }

        return;
      }

      case 'Escape': {
        if (!shown) {
          return;
        }

        // Closes the list, not the dialog.
        pressed.preventDefault();

        pressed.stopPropagation();

        close();

        return;
      }

      case 'Backspace': {
        const last = labels.getSnapshot().value.at(-1);

        // Held down, what clears the box does not go on to the chips.
        if (typed !== '' || last === undefined || pressed.repeat) {
          return;
        }

        pressed.preventDefault();

        remove(last);

        break;
      }

      default:
        // Any other key is the box's own.
        break;
    }
  };

  return (
    <div class={constant('field field-wide label-input')}>
      <label class={constant('bp6-label field-label')} htmlFor={constant(id)}>
        {constant(caption)}
      </label>
      <div
        class={constant('bp6-input label-input-box')}
        onPointerDown={(pressed) => {
          mut_pointerType = pressed.pointerType;
        }}
        // A press anywhere in the box but on a chip's button types in it.
        onMouseDown={(pressed) => {
          if (
            pressed.target === mut_box ||
            pressed.target instanceof HTMLButtonElement
          ) {
            return;
          }

          pressed.preventDefault();

          mut_box?.focus();
        }}
      >
        <For items={labels} key={(label) => label}>
          {(label$) => (
            <span class={constant('bp6-tag bp6-minimal label-chip')}>
              <span
                class={constant('label-chip-text')}
                data-e2e={constant('label-chip')}
                title={label$}
              >
                {label$}
              </span>
              <button
                aria-label={view(label$, (label) => m.labels.remove(label))}
                class={constant('label-chip-remove')}
                type={constant('button')}
                value={label$}
                onClick={(clicked) => {
                  remove(clicked.currentTarget.value);

                  // The button goes with its chip: the focus goes back to the
                  // box rather than to the top of the dialog — but not on a
                  // tap, which would bring up a phone's keyboard.
                  if (mut_pointerType !== 'touch' || clicked.detail === 0) {
                    mut_box?.focus();
                  }
                }}
              >
                {constant('×')}
              </button>
            </span>
          )}
        </For>
        <input
          aria-activedescendant={combine([options$, shown$]).pipe(
            map(([options, shown]) =>
              shown ? options.find(({ active }) => active)?.id : undefined,
            ),
          )}
          aria-autocomplete={constant('list')}
          aria-controls={view(shown$, (shown) => (shown ? listId : undefined))}
          aria-expanded={view(shown$, (shown) => (shown ? 'true' : 'false'))}
          autocapitalize={constant('off')}
          autocomplete={constant('off')}
          class={constant('label-input-text')}
          data-e2e={constant(e2e)}
          enterKeyHint={constant('enter')}
          id={constant(id)}
          ref={(box) => {
            mut_box = box;
          }}
          role={constant('combobox')}
          type={constant('text')}
          // Not for a tap on the list, which a phone may move the focus to
          // before its click.
          onBlur={onBlur}
          onCompositionEnd={(ended) => {
            const box = ended.currentTarget;

            // Also as the box goes with the form, which ends a composition:
            // not while that is under way.
            afterUpdate(() => {
              if (!box.isConnected) {
                return;
              }

              // Not for a composition ended by leaving the box.
              if (document.activeElement === box) {
                setOpen(true);
              }

              follow(box.value);
            });
          }}
          onFocus={() => {
            setOpen(true);
          }}
          onInput={(changed) => {
            setOpen(true);

            // An IME's comma is not one until the composition ends; what it
            // composes is suggested for as it is, as a phone's keyboard
            // composes every word.
            if (changed instanceof InputEvent && changed.isComposing) {
              setTyped(splitTypedLabels(changed.currentTarget.value).rest);

              setActive(undefined);

              return;
            }

            follow(changed.currentTarget.value);
          }}
          onKeyDown={onKeyDown}
        />
      </div>
      <If
        cond={shown$}
        then={
          <ul
            aria-label={constant(m.labels.suggestions(caption))}
            class={constant('label-suggestions')}
            id={constant(listId)}
            // A press on it, between its options too, keeps the focus, and the
            // list, in the box.
            onMouseDown={(pressed) => {
              pressed.preventDefault();
            }}
            ref={(list) => {
              mut_list = list;

              // Once laid out, into view above a phone's keyboard.
              requestAnimationFrame(() => {
                list.scrollIntoView({ block: 'nearest' });
              });
            }}
            role={constant('listbox')}
          >
            <For items={options$} key={(option) => option.label}>
              {(option$) => (
                <li
                  aria-selected={view(option$, ({ active }) =>
                    active ? 'true' : 'false',
                  )}
                  class={view(option$, ({ active }) =>
                    active ? 'label-suggestion active' : 'label-suggestion',
                  )}
                  data-e2e={constant('label-suggestion')}
                  id={view(option$, (option) => option.id)}
                  role={constant('option')}
                  // Focusable, so that the focus a tap may take from the box
                  // stays in the list (`onBlur`).
                  tabIndex={constant(-1)}
                  onBlur={onBlur}
                  onClick={() => {
                    choose(option$.getSnapshot().value.label);

                    mut_box?.focus();
                  }}
                >
                  {view(option$, ({ label }) => label)}
                </li>
              )}
            </For>
          </ul>
        }
      />
    </div>
  );
};

/** The key code of a key down that an IME takes. */
const IME_KEY_CODE = 229;
