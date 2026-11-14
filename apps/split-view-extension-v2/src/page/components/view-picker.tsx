import { createBooleanState, derive, map } from 'synstate';
import {
  constant,
  createAfterUpdate,
  For,
  If,
  listenInScope,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { entryOf, type SplitViewList } from '../../core/index.mjs';
import type { Controller } from '../controller.mjs';
import { Icon } from './icon.js';
import { ViewEditor } from './view-editor.js';

/**
 * Which split view this tab shows, and everything done to the list (spec
 * W1–W6): a `select`, `＋` and `Edit`, sharing the top bar's one row; editing
 * floats over the stage rather than taking a row from every pane.
 */
export const ViewPicker = ({
  controller,
}: Readonly<{ controller: Controller }>): JSX.Element => {
  const { session$, list$ } = controller;

  const afterUpdate = createAfterUpdate();

  const [editing$, { setFalse: stopEditing, toggle: toggleEditing }] =
    createBooleanState(false);

  const mut_refs: { root: HTMLElement | undefined; pendingSwitches: number } = {
    root: undefined,
    pendingSwitches: 0,
  };

  const shownId$ = session$.pipe(map(({ id }) => id));

  const entry$ = derive([shownId$, list$], (id, list: SplitViewList) =>
    id === undefined ? undefined : entryOf(list, id),
  );

  // A switch leaves the popover about another split view, so it closes.
  shownId$.subscribe(() => {
    afterUpdate(stopEditing);
  });

  // Escape, or a press outside it that this page sees (one in a pane is the
  // frame's), closes it.
  listenInScope(globalThis, 'pointerdown', (event) => {
    if (
      Optional.unwrap(editing$.getSnapshot()) &&
      mut_refs.root !== undefined &&
      event.target instanceof Node &&
      !mut_refs.root.contains(event.target)
    ) {
      stopEditing();
    }
  });

  listenInScope(globalThis, 'keydown', (event) => {
    if (event instanceof KeyboardEvent && event.key === 'Escape') {
      stopEditing();
    }
  });

  return (
    <span
      ref={(element) => {
        mut_refs.root = element;
      }}
      class={constant('view-picker')}
    >
      <select
        aria-label={constant('The split view shown here')}
        class={constant('view-picker__select')}
        data-e2e={constant('view-select')}
        title={constant(
          'The split view shown in this tab. Alt+1..9 switches too.',
        )}
        value={shownId$.pipe(map((id) => id ?? ''))}
        onChange={(event) => {
          const mut_select = event.currentTarget;

          // The choice stays while switches run; once the last settles, the
          // select shows what is on screen, which differs if one failed.
          mut_refs.pendingSwitches += 1;

          controller
            .switchTo(mut_select.value)
            .finally(() => {
              mut_refs.pendingSwitches -= 1;

              if (mut_refs.pendingSwitches === 0) {
                mut_select.value =
                  Optional.unwrap(shownId$.getSnapshot()) ?? '';
              }
            })
            .catch(console.error);
        }}
      >
        <For
          items={list$.pipe(map(({ entries }) => entries))}
          key={({ id }) => id}
        >
          {(row$, index$) => (
            <option value={row$.pipe(map(({ id }) => id))}>
              {derive(
                [row$, index$],
                ({ name }, index) => `${(index + 1).toString()}: ${name}`,
              )}
            </option>
          )}
        </For>
      </select>

      <button
        aria-label={constant('Add a split view')}
        class={constant('button')}
        data-e2e={constant('view-add')}
        title={constant('Add a split view and open it in a new tab')}
        type={constant('button')}
        onClick={controller.create}
      >
        <Icon icon={'plus'} />
      </button>

      <button
        aria-expanded={editing$.pipe(map((editing) => editing.toString()))}
        aria-haspopup={constant('dialog')}
        class={constant('button')}
        data-e2e={constant('view-edit')}
        title={constant(
          'Rename, reorder or delete this split view, open one or all in tabs, export and import',
        )}
        type={constant('button')}
        onClick={() => {
          toggleEditing();
        }}
      >
        {constant('Edit')}
      </button>

      <If
        cond={derive(
          [editing$, entry$],
          (editing, entry) => editing && entry !== undefined,
        )}
        then={
          <ViewEditor
            entry$={entry$}
            onExport={controller.exportBackup}
            onImport={controller.importBackup}
            onMove={controller.move}
            onOpenAll={controller.openAll}
            onOpenInNewTab={controller.openInNewTab}
            onRemove={controller.remove}
            onRename={controller.rename}
          />
        }
      />
    </span>
  );
};
