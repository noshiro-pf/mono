import {
  createBooleanState,
  derive,
  map,
  type InitializedObservable,
} from 'synstate';
import {
  constant,
  createAfterUpdate,
  For,
  If,
  isImeKeyDown,
  listenInScope,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import type { WorkspaceRegistry } from '../state/index.mjs';
import { Icon } from './icon.js';
import { WorkspaceEditor } from './workspace-editor.js';

type Props = Readonly<{
  activeId: InitializedObservable<string | undefined>;
  /** What the last import or the last "open all" had to say. */
  notice: Bindable<string | undefined>;
  registry: InitializedObservable<WorkspaceRegistry>;
  onCreate: () => void;
  onExport: () => void;
  onImport: (text: string) => void;
  onMove: (workspaceId: string, offset: number) => void;
  onOpenAll: () => void;
  onOpenInNewTab: (workspaceId: string) => void;
  onRemove: (workspaceId: string) => void;
  onRename: (workspaceId: string, workspaceName: string) => void;
  /** Settles once the tab shows `workspaceId`, or has failed to. */
  onSwitch: (workspaceId: string) => Promise<void>;
}>;

/**
 * Which split view this tab is showing, and everything done to the list.
 *
 * Three controls wide — a `select`, `＋`, `Edit` — because it shares the one
 * toolbar row with the layout presets, and a second row would cost every pane
 * the height of it for the whole session. Editing therefore happens in a
 * popover that floats over the stage rather than in a strip that pushes it
 * down, and the list is a `select` rather than a chip per workspace, which
 * stays one line wide however many there are.
 *
 * It renders as a fragment inside the toolbar's row; the wrapper is
 * `display: contents`, so it is in the DOM for "did the click land outside the
 * popover" without being a box in the layout.
 */
export const WorkspacePicker = ({
  activeId,
  notice,
  registry,
  onCreate,
  onExport,
  onImport,
  onMove,
  onOpenAll,
  onOpenInNewTab,
  onRemove,
  onRename,
  onSwitch,
}: Props): JSX.Element => {
  const [editing$, { setFalse: stopEditing, toggle: toggleEditing }] =
    createBooleanState(false);

  const afterUpdate = createAfterUpdate();

  const mut_state: {
    root: HTMLSpanElement | undefined;
    /** Switches asked for from the select that have not settled yet. */
    pendingSwitches: number;
  } = {
    root: undefined,
    pendingSwitches: 0,
  };

  const active$ = derive([activeId, registry], (id, list) =>
    list.entries.find((entry) => entry.id === id),
  );

  // Switching is the one action that leaves the popover about something else,
  // so it closes it; the rest are edits to the workspace it is open on.
  activeId.subscribe(() => {
    afterUpdate(stopEditing);
  });

  /**
   * Escape, or a click anywhere but in the popover, closes it.
   *
   * A click *inside a pane* is not one of those: it goes to the frame and never
   * reaches this page. The popover stays open over it, which is the price of
   * not having a row of its own.
   */
  listenInScope(globalThis, 'pointerdown', (pointerEvent) => {
    const { root } = mut_state;

    if (
      root !== undefined &&
      editing$.getSnapshot().value &&
      pointerEvent.target instanceof Node &&
      !root.contains(pointerEvent.target)
    ) {
      stopEditing();
    }
  });

  listenInScope(globalThis, 'keydown', (keyboardEvent) => {
    if (
      editing$.getSnapshot().value &&
      keyboardEvent instanceof KeyboardEvent &&
      keyboardEvent.key === 'Escape' &&
      !isImeKeyDown(keyboardEvent)
    ) {
      stopEditing();
    }
  });

  return (
    <span
      ref={(element) => {
        mut_state.root = element;
      }}
      class={constant('workspace-picker')}
    >
      <select
        aria-label={constant('The split view shown here')}
        class={constant('workspace-picker__select')}
        title={constant(
          'The split view shown in this tab. Alt+1..9 switches too.',
        )}
        value={activeId.pipe(map((id) => id ?? ''))}
        onChange={(changeEvent) => {
          const mut_select = changeEvent.currentTarget;

          // The choice stays shown while switches run, so a second step from
          // the keyboard starts from it. Once the last has run, the select
          // shows the split view on screen, which is not the choice when the
          // switch failed.
          mut_state.pendingSwitches += 1;

          onSwitch(mut_select.value)
            .finally(() => {
              mut_state.pendingSwitches -= 1;

              if (mut_state.pendingSwitches === 0) {
                mut_select.value = activeId.getSnapshot().value ?? '';
              }
            })
            .catch(console.error);
        }}
      >
        <For
          items={registry.pipe(map((list) => list.entries))}
          key={(entry) => entry.id}
        >
          {(entry$, index$) => (
            <option value={entry$.pipe(map((entry) => entry.id))}>
              {derive(
                [entry$, index$],
                (entry, index) => `${(index + 1).toString()}: ${entry.name}`,
              )}
            </option>
          )}
        </For>
      </select>

      <button
        class={constant('top-bar__button')}
        title={constant('Add a split view and open it in a new tab')}
        type={constant('button')}
        onClick={onCreate}
      >
        <Icon icon={'plus'} />
      </button>

      <button
        aria-expanded={editing$.pipe(
          map((shown) => (shown ? 'true' : 'false')),
        )}
        class={constant('top-bar__button')}
        title={constant(
          'Rename, reorder or delete this split view, open one or all of them in tabs, export and import',
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
          [editing$, active$],
          (editing, active) => editing && active !== undefined,
        )}
        then={
          <WorkspaceEditor
            entry$={active$}
            notice={notice}
            onExport={onExport}
            onImport={onImport}
            onMove={onMove}
            onOpenAll={onOpenAll}
            onOpenInNewTab={onOpenInNewTab}
            onRemove={onRemove}
            onRename={onRename}
          />
        }
      />
    </span>
  );
};
